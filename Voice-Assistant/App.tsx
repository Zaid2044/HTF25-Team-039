import React, { useState, useRef, useCallback, useEffect } from 'react';
// FIX: Removed `LiveSession` as it is not an exported member of '@google/genai'.
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';
import { AssistantStatus, Transcription } from './types';
import { encode, decode, decodeAudioData } from './utils/audioUtils';
import { CodeEditor } from './components/CodeEditor';
import { AssistantPanel } from './components/AssistantPanel';
import { getLanguageConfig } from './config/languages';

const App: React.FC = () => {
    const [code, setCode] = useState<string>('// Speak to start coding...\n\nfunction helloWorld() {\n  console.log("Hello, world!");\n}\n');
    const [language, setLanguage] = useState<string>('javascript');
    const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>(AssistantStatus.IDLE);
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [executionOutput, setExecutionOutput] = useState<string>('');

    // FIX: Replaced `LiveSession` with `any` as the live session type is not exported from the library.
    const sessionPromise = useRef<Promise<any> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const codeRef = useRef(code);
    useEffect(() => {
        codeRef.current = code;
    }, [code]);
    
    const languageRef = useRef(language);
    useEffect(() => {
        languageRef.current = language;
    }, [language]);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        if (newCode.trim() === '') {
            setExecutionOutput('');
        }
    };

    const handleLanguageChange = (langId: string) => {
        setLanguage(langId);
        setCode(`// Switched to ${getLanguageConfig(langId).name}. Start coding...`);
        setExecutionOutput('');
    }

    const handleExecuteCode = useCallback(() => {
        const langConfig = getLanguageConfig(languageRef.current);
        const currentCode = codeRef.current;

        switch(langConfig.id) {
            case 'javascript':
                const logs: string[] = [];
                const originalConsoleLog = console.log;
                console.log = (...args: any[]) => {
                    logs.push(args.map(arg => {
                        try {
                            if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg, null, 2);
                            return String(arg);
                        } catch (e) {
                            return '[Unserializable Object]';
                        }
                    }).join(' '));
                    originalConsoleLog.apply(console, args);
                };
                try {
                    new Function(`'use strict';\n${currentCode}`)();
                    setExecutionOutput(logs.join('\n'));
                } catch (error) {
                    if (error instanceof Error) {
                        setExecutionOutput(`Error: ${error.message}\n\nStack Trace:\n${error.stack}`);
                    } else {
                        setExecutionOutput(`An unknown error occurred: ${String(error)}`);
                    }
                } finally {
                    console.log = originalConsoleLog;
                }
                break;
            
            case 'html':
                setExecutionOutput(currentCode);
                break;

            case 'css':
                const previewHtml = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>CSS Preview</title>
                        <style>
                            body { font-family: sans-serif; padding: 1rem; color: #333; }
                            ${currentCode}
                        </style>
                    </head>
                    <body>
                        <h1>Styled Header</h1>
                        <p>This paragraph and the button below are styled by your CSS code.</p>
                        <button class="custom-btn">Click Me</button>
                    </body>
                    </html>
                `;
                setExecutionOutput(previewHtml);
                break;
            
            case 'python':
                const pythonOutput = `
# Simulated Python Execution Output
# Full Python execution requires a server-side environment.

--- Your Code ---
${currentCode}
                `;
                setExecutionOutput(pythonOutput);
                break;
        }
    }, []);

    const addTranscription = useCallback((transcription: Transcription) => {
        setTranscriptions(prev => [...prev.slice(-9), transcription]);
    }, []);

    const functions: FunctionDeclaration[] = [
        {
            name: 'updateCode',
            parameters: {
                type: Type.OBJECT,
                description: "Replaces the entire content of the code editor. Use for major changes or initial code generation.",
                properties: { code: { type: Type.STRING, description: 'The new, complete code content.' } },
                required: ['code'],
            },
        },
        {
            name: 'appendCode',
            parameters: {
                type: Type.OBJECT,
                description: "Adds code to the end of the current content.",
                properties: { codeToAppend: { type: Type.STRING, description: 'The code snippet to add.' } },
                required: ['codeToAppend'],
            },
        },
        {
            name: 'replaceCodeRange',
            parameters: {
                type: Type.OBJECT,
                description: "Replaces a range of lines with new code.",
                properties: {
                    startLine: { type: Type.INTEGER, description: 'The 1-indexed starting line number.' },
                    endLine: { type: Type.INTEGER, description: 'The 1-indexed ending line number.' },
                    newCode: { type: Type.STRING, description: 'The code to insert in place of the range.' },
                },
                required: ['startLine', 'endLine', 'newCode'],
            },
        },
        {
            name: 'executeCode',
            parameters: {
                type: Type.OBJECT,
                description: "Executes the current code in the editor. Use this when the user says 'run', 'execute', or 'test the code'.",
                properties: {},
                required: [],
            },
        },
    ];

    const executeToolCall = useCallback((name: string, args: any) => {
        const lines = codeRef.current.split('\n');
        let newLines = [...lines];

        switch (name) {
            case 'updateCode':
                setCode(args.code);
                break;
            case 'appendCode':
                setCode(prev => `${prev}\n${args.codeToAppend}`);
                break;
            case 'replaceCodeRange':
                const start = Math.max(0, args.startLine - 1);
                const end = Math.min(lines.length, args.endLine);
                newLines.splice(start, end - start, ...args.newCode.split('\n'));
                setCode(newLines.join('\n'));
                break;
            case 'executeCode':
                handleExecuteCode();
                break;
            default:
                console.warn(`Unknown function call: ${name}`);
        }
    }, [handleExecuteCode]);


    const stopAssistant = useCallback(async () => {
        setAssistantStatus(AssistantStatus.IDLE);
        if (sessionPromise.current) {
            try {
                const session = await sessionPromise.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
            sessionPromise.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }, []);

    const startAssistant = useCallback(async () => {
        setAssistantStatus(AssistantStatus.LISTENING);
        setTranscriptions([]);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            
            let nextStartTime = 0;
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            const langConfig = getLanguageConfig(languageRef.current);

            sessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: `You are an expert AI code assistant for ${langConfig.name}. The user's current code is: \n\`\`\`\n${codeRef.current}\n\`\`\`\n. Analyze their voice command and use the provided tools to modify the code. When the user asks to run or test the code, use the 'executeCode' function. Only use the available functions. Keep your spoken responses concise and confirm the action, e.g., "Done" or "Okay, running the code."`,
                    tools: [{ functionDeclarations: functions }],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;

                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            if (sessionPromise.current) {
                                sessionPromise.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.toolCall) {
                             for (const fc of message.toolCall.functionCalls) {
                                try {
                                    executeToolCall(fc.name, fc.args);
                                    if (sessionPromise.current) {
                                        sessionPromise.current.then(session => {
                                            session.sendToolResponse({
                                                functionResponses: { id: fc.id, name: fc.name, response: { result: "OK" } }
                                            });
                                        });
                                    }
                                } catch (error) {
                                    console.error("Error executing tool call:", error);
                                    const errorMessage = error instanceof Error ? error.message : String(error);
                                    addTranscription({ speaker: 'System', text: `Execution failed: ${errorMessage}` });
                                    if (sessionPromise.current) {
                                        sessionPromise.current.then(session => {
                                            session.sendToolResponse({
                                                functionResponses: {
                                                    id: fc.id,
                                                    name: fc.name,
                                                    response: { error: `Execution failed: ${errorMessage}` }
                                                }
                                            });
                                        });
                                    }
                                }
                            }
                        }
                        
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            if(currentInputTranscription.trim()){
                                addTranscription({ speaker: 'You', text: currentInputTranscription.trim() });
                            }
                            if(currentOutputTranscription.trim()){
                                addTranscription({ speaker: 'Assistant', text: currentOutputTranscription.trim() });
                            }
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Session error:", e);
                        addTranscription({ speaker: 'System', text: `Error: ${e.message}` });
                        setAssistantStatus(AssistantStatus.ERROR);
                        stopAssistant();
                    },
                    onclose: (e: CloseEvent) => {
                        setAssistantStatus(AssistantStatus.IDLE);
                    },
                },
            });

        } catch (error) {
            console.error("Failed to start assistant:", error);
            addTranscription({ speaker: 'System', text: "Failed to access microphone. Please check permissions." });
            setAssistantStatus(AssistantStatus.ERROR);
        }
    }, [addTranscription, stopAssistant, executeToolCall, functions]);

    const handleToggleAssistant = () => {
        if (assistantStatus === AssistantStatus.LISTENING) {
            stopAssistant();
        } else {
            startAssistant();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
            <header className="p-4 border-b border-gray-700 shadow-lg">
                <h1 className="text-2xl font-bold text-cyan-400 text-center tracking-wider">
                    Voice-Enabled Code Assistant
                </h1>
            </header>
            <main className="flex flex-1 overflow-hidden p-4 gap-4">
                <div className="flex-grow w-2/3 flex flex-col">
                    <CodeEditor
                        code={code}
                        onCodeChange={handleCodeChange}
                        onExecute={handleExecuteCode}
                        output={executionOutput}
                        language={language}
                        onLanguageChange={handleLanguageChange}
                    />
                </div>
                <div className="w-1/3 flex flex-col">
                    <AssistantPanel
                        status={assistantStatus}
                        transcriptions={transcriptions}
                        onToggleAssistant={handleToggleAssistant}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;
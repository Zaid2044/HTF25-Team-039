import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon, TrashIcon, PlayIcon } from './Icons';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../config/languages';

interface CodeEditorProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    onExecute: () => void;
    output: string;
    language: string;
    onLanguageChange: (langId: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, onExecute, output, language, onLanguageChange }) => {
    const [lineCount, setLineCount] = useState(1);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const langConfig = getLanguageConfig(language);

    useEffect(() => {
        setLineCount(code.split('\n').length);
    }, [code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    };

    const handleClear = () => {
        onCodeChange('');
    };

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-inner flex flex-col flex-grow w-full h-full overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50 border-b border-gray-600">
                <div className="flex items-center gap-4">
                     <span className="text-sm font-medium text-gray-400">assistant.{langConfig.extension}</span>
                     <select 
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="bg-gray-600 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                     >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                     </select>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={onExecute} 
                        className="flex items-center text-gray-400 transition-colors hover:text-green-400" 
                        title="Execute Code"
                    >
                         <PlayIcon />
                         <span className="ml-1 text-sm font-medium">Execute</span>
                    </button>
                    <button onClick={handleClear} className="text-gray-400 hover:text-red-400 transition-colors" title="Clear Code">
                        <TrashIcon />
                    </button>
                    <button onClick={handleCopy} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center" title="Copy Code">
                        <span className="text-sm mr-2">{copyStatus === 'copied' ? 'Copied!' : 'Copy'}</span>
                        <CopyIcon />
                    </button>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div ref={lineNumbersRef} className="p-4 font-mono text-right text-gray-500 bg-gray-800 select-none overflow-y-hidden">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value)}
                    onScroll={handleScroll}
                    className="flex-1 p-4 font-mono text-gray-200 bg-gray-800 resize-none focus:outline-none w-full"
                    spellCheck="false"
                    wrap="off"
                />
            </div>
            <div className="h-48 flex flex-col border-t border-gray-600">
                <div className="px-4 py-2 bg-gray-700/50 text-sm font-medium text-gray-400">
                    Output
                </div>
                <div className="flex-1 bg-gray-900/50 overflow-auto">
                    {!output ? (
                         <span className="text-gray-500 p-4 block">Click "Execute" to run the code.</span>
                    ) : langConfig.renderAs === 'html' ? (
                        <iframe
                            srcDoc={output}
                            title="Output Preview"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts"
                        />
                    ) : (
                         <pre className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words h-full">
                            {output}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};
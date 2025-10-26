
import React from 'react';
import { AssistantStatus, Transcription } from '../types';
import { MicrophoneIcon } from './Icons';

interface AssistantPanelProps {
    status: AssistantStatus;
    transcriptions: Transcription[];
    onToggleAssistant: () => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ status, transcriptions, onToggleAssistant }) => {
    
    const getStatusInfo = () => {
        switch (status) {
            case AssistantStatus.LISTENING:
                return { text: 'Listening...', color: 'text-green-400', pulse: true };
            case AssistantStatus.PROCESSING:
                return { text: 'Processing...', color: 'text-yellow-400', pulse: true };
            case AssistantStatus.ERROR:
                return { text: 'Error Occurred', color: 'text-red-400', pulse: false };
            case AssistantStatus.IDLE:
            default:
                return { text: 'Ready', color: 'text-cyan-400', pulse: false };
        }
    };

    const { text, color, pulse } = getStatusInfo();

    const buttonClasses = status === AssistantStatus.LISTENING 
        ? "bg-red-500 hover:bg-red-600" 
        : "bg-cyan-500 hover:bg-cyan-600";

    return (
        <div className="bg-gray-800 rounded-lg shadow-inner flex flex-col h-full w-full p-4">
            <h2 className="text-xl font-bold mb-4 text-purple-400">Assistant</h2>
            
            <div className="flex items-center mb-4 space-x-2">
                <div className={`w-3 h-3 rounded-full ${pulse ? 'animate-pulse' : ''} ${color.replace('text-', 'bg-')}`}></div>
                <span className={`font-medium ${color}`}>{text}</span>
            </div>

            <div className="flex-grow bg-gray-900/50 rounded p-3 mb-4 overflow-y-auto min-h-0">
                <div className="space-y-3">
                    {transcriptions.length > 0 ? (
                        transcriptions.map((t, i) => (
                            <div key={i} className={`text-sm ${t.speaker === 'You' ? 'text-gray-300' : 'text-cyan-300'}`}>
                                <span className="font-bold">{t.speaker}:</span> {t.text}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center pt-4">
                           {status === AssistantStatus.LISTENING ? "Start speaking..." : "Click the microphone to start."}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={onToggleAssistant}
                className={`w-full flex items-center justify-center p-4 rounded-lg text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${buttonClasses}`}
            >
                <MicrophoneIcon />
                <span className="ml-2">{status === AssistantStatus.LISTENING ? 'Stop Assistant' : 'Start Assistant'}</span>
            </button>
        </div>
    );
};

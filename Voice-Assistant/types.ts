
export enum AssistantStatus {
    IDLE = 'idle',
    LISTENING = 'listening',
    PROCESSING = 'processing',
    ERROR = 'error',
}

export interface Transcription {
    speaker: 'You' | 'Assistant' | 'System';
    text: string;
}

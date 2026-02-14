import axios, { AxiosInstance } from 'axios';
import { env } from './env';
import { logger } from '../utils/logger';

export interface OllamaGenerateOptions {
    model?: string;
    system?: string;
    stream?: boolean;
    temperature?: number;
    top_p?: number;
}

export interface OllamaChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class OllamaClient {
    private client: AxiosInstance;
    private model: string;

    constructor(baseURL?: string, model?: string) {
        this.model = model || env.OLLAMA_MODEL;
        this.client = axios.create({
            baseURL: baseURL || env.OLLAMA_BASE_URL,
            timeout: 120000, // 2 minutes for AI generation
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async generate(prompt: string, options: OllamaGenerateOptions = {}): Promise<string> {
        try {
            const response = await this.client.post('/api/generate', {
                model: options.model || this.model,
                prompt,
                system: options.system,
                stream: false,
                options: {
                    temperature: options.temperature ?? 0.7,
                    top_p: options.top_p ?? 0.9,
                },
            });
            return response.data.response;
        } catch (error: any) {
            logger.error('Ollama generate error:', error.message);
            throw new Error(`Ollama generation failed: ${error.message}`);
        }
    }

    async chat(messages: OllamaChatMessage[], options: OllamaGenerateOptions = {}): Promise<string> {
        try {
            const response = await this.client.post('/api/chat', {
                model: options.model || this.model,
                messages,
                stream: false,
                options: {
                    temperature: options.temperature ?? 0.7,
                    top_p: options.top_p ?? 0.9,
                },
            });
            return response.data.message.content;
        } catch (error: any) {
            logger.error('Ollama chat error:', error.message);
            throw new Error(`Ollama chat failed: ${error.message}`);
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            await this.client.get('/api/tags');
            return true;
        } catch {
            return false;
        }
    }
}

// Singleton instance
export const ollamaClient = new OllamaClient();

import { useState, useRef, useEffect } from 'react';
import { agentService } from '../services';
import type { ChatMessage } from '../types';
import { Send, Bot, User, Loader2, Sparkles, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
    'Find all students with GPA above 3.5',
    'Which majors have the most students?',
    'Show me at-risk students who need attention',
    'What is the average GPA across all departments?',
    'Recommend courses for a Computer Science student',
];

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const message = text || input.trim();
        if (!message) return;

        const userMsg: ChatMessage = { role: 'user', content: message, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await agentService.chat(message, history);
            const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: res.data?.message || 'Sorry, I could not process your request.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err: any) {
            toast.error('Failed to get response');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I encountered an error processing your request. Please try again.',
                timestamp: new Date(),
            }]);
        } finally { setLoading(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] fade-in">
            {/* Header */}
            <div className="mb-3">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-violet-400" /> AI Assistant
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">Ask questions about students, get insights, and receive recommendations</p>
            </div>

            {/* Chat */}
            <div className="flex-1 card flex flex-col overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-auto p-5 space-y-3">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 30px rgba(99,102,241,0.2)' }}>
                                <Bot size={28} className="text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-white mb-1">How can I help you?</h2>
                            <p className="text-xs text-gray-500 mb-5 max-w-sm">
                                I can analyze student profiles, answer questions about your data, and provide recommendations.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full">
                                {SUGGESTIONS.map((s) => (
                                    <button key={s} onClick={() => sendMessage(s)}
                                        className="text-left px-3 py-2.5 rounded-lg text-xs text-gray-400 transition-all flex items-start gap-2 cursor-pointer"
                                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'transparent'; }}>
                                        <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                        <Bot size={14} className="text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-md'
                                    : 'text-gray-300 rounded-bl-md'
                                    }`} style={msg.role === 'assistant' ? { background: '#1e2030' } : {}}>
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                        <User size={14} className="text-indigo-400" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="flex gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <Bot size={14} className="text-white" />
                            </div>
                            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md" style={{ background: '#1e2030' }}>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" style={{ animation: 'pulse-dot 1.4s ease-in-out infinite', animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" style={{ animation: 'pulse-dot 1.4s ease-in-out infinite', animationDelay: '200ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" style={{ animation: 'pulse-dot 1.4s ease-in-out infinite', animationDelay: '400ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex gap-2">
                        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                            className="input flex-1" placeholder="Ask about students, performance, or get recommendations..."
                            disabled={loading} />
                        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                            className="btn-primary px-3 cursor-pointer" style={{ boxShadow: 'none' }}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

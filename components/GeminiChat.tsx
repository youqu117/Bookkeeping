import React, { useState, useRef, useEffect } from 'react';
import { Tag, Account, Transaction, ChatMessage } from '../types';
import { processWithGemini } from '../services/geminiService';
import { Send, X, Sparkles, Check, Loader2 } from 'lucide-react';

interface GeminiChatProps {
  apiKey: string;
  tags: Tag[];
  accounts: Account[];
  recentTransactions: Transaction[];
  onClose: () => void;
  onSaveTransaction: (tx: Omit<Transaction, 'id'>) => void;
  themeStyles: any;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ 
  apiKey, tags, accounts, recentTransactions, onClose, onSaveTransaction, themeStyles: T 
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: 'welcome', role: 'assistant', text: 'Hi! I can help you track expenses or analyze your recent spending. Just say "Lunch $15" or "How much did I spend recently?"' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        const response = await processWithGemini(apiKey, userMsg.text!, { tags, accounts, recentTransactions });
        
        const aiMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: response.text,
            isAnalysis: response.action === 'analysis'
        };

        if (response.action === 'create' && response.data) {
            // Fill in defaults if missing
            aiMsg.transactionData = {
                date: Date.now(),
                isConfirmed: true,
                images: [],
                ...response.data
            };
        }

        setMessages(prev => [...prev, aiMsg]);

    } catch (e) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', text: 'Something went wrong. Please check your connection.' }]);
    } finally {
        setLoading(false);
    }
  };

  const handleSavePreview = (msgId: string, tx: Partial<Transaction>) => {
      if (tx.amount && tx.type && tx.accountId) {
          onSaveTransaction(tx as any);
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: 'Transaction saved successfully! ✅', transactionData: undefined } : m));
      }
  };

  const isDark = T.bg === 'bg-slate-900';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`w-full max-w-md h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative ${T.bg} ${T.text}`}>
            
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={20} />
                    <h3 className="font-black text-lg">Gemini Assistant</h3>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X size={20}/></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map(msg => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                            {msg.text && (
                                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm font-medium ${
                                    isUser 
                                    ? `${T.accent}` 
                                    : `${isDark ? 'bg-slate-800 text-slate-200' : 'bg-white border shadow-sm text-slate-700'}`
                                }`}>
                                    {msg.text}
                                </div>
                            )}

                            {/* Transaction Preview Card */}
                            {msg.transactionData && (
                                <div className={`mt-2 p-4 rounded-2xl border w-full max-w-[85%] animate-in slide-in-from-bottom-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'}`}>
                                    <div className="text-[10px] font-bold uppercase opacity-50 mb-2">New Transaction</div>
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <div className="text-2xl font-black">
                                                {msg.transactionData.type === 'expense' ? '-' : '+'}{msg.transactionData.amount?.toLocaleString()}
                                            </div>
                                            <div className="text-xs opacity-70">
                                                {msg.transactionData.note || 'No description'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {msg.transactionData.tags?.map(tid => {
                                                const tag = tags.find(t => t.id === tid);
                                                return tag ? <span key={tid} className={`text-[10px] px-2 py-1 rounded-full border ${tag.color}`}>{tag.name}</span> : null;
                                            })}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSavePreview(msg.id, msg.transactionData!)}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${T.accent}`}
                                    >
                                        <Check size={16} /> Save Record
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {loading && (
                    <div className="flex items-center gap-2 opacity-50 text-xs font-bold pl-2">
                        <Loader2 size={12} className="animate-spin" /> Thinking...
                    </div>
                )}
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-2 p-2 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type 'Lunch $20'..."
                        className="flex-1 bg-transparent px-2 py-1 outline-none text-sm font-medium"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className={`p-2 rounded-xl transition-all ${!input.trim() ? 'opacity-30' : 'hover:scale-105'} ${T.accent}`}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};
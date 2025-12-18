import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, PlusCircle, Bot } from 'lucide-react';
import { ChatMessage, PBLComponentData } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface RightPanelProps {
  onAddComponentFromAI: (data: Partial<PBLComponentData>) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onAddComponentFromAI }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '你好！我是你的 AI 教学设计助理。 \n我可以帮你设计驱动性问题、核心任务或评价量表。\n\n这学期的课程主题是什么？' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const responseText = await generateChatResponse(messages, input);
    
    // Simple logic to detect if we should suggest adding something
    let suggestedAction = undefined;
    if (responseText.includes("驱动性问题") || responseText.includes("核心任务")) {
         suggestedAction = {
             label: "添加到画布",
             actionType: 'add-to-canvas' as const,
             data: {
                 category: 'driving-question',
                 title: 'AI 建议组件',
                 type: 'dq-forward',
                 fields: [
                     { id: 'ai-1', label: '摘要', value: responseText.slice(0, 50) + '...', placeholder: '' }
                 ],
                 result: responseText,
                 isExpanded: true
             }
         }
    }

    const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText,
        suggestedAction
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l-3 border-doodle-black z-20 shadow-pop-sm">
      {/* Header */}
      <div className="h-20 flex items-center px-6 border-b-3 border-doodle-black bg-doodle-yellow">
        <div className="flex items-center space-x-3">
          <div className="relative">
             <div className="w-12 h-12 rounded-xl bg-white border-3 border-doodle-black flex items-center justify-center text-doodle-black shadow-pop-sm">
                <Bot size={24} />
             </div>
             <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-doodle-green border-2 border-doodle-black rounded-full"></span>
          </div>
          <div>
            <h2 className="font-black font-display text-doodle-black text-lg">AI 助手</h2>
            <p className="text-xs text-doodle-black/70 font-bold uppercase">在线中</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 bg-doodle-bg">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium border-3 border-doodle-black shadow-pop-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-doodle-black text-white rounded-tr-none' 
                : 'bg-white text-doodle-black rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {/* Action Buttons for AI messages */}
              {msg.role === 'model' && msg.suggestedAction && (
                <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200">
                   <button 
                     onClick={() => msg.suggestedAction?.data && onAddComponentFromAI(msg.suggestedAction.data)}
                     className="flex items-center space-x-2 text-xs font-black text-doodle-black bg-doodle-yellow px-3 py-2 rounded-lg border-2 border-doodle-black hover:bg-yellow-300 hover:shadow-pop-sm active:translate-y-0.5 active:shadow-none transition-all w-full justify-center"
                   >
                     <PlusCircle size={16} />
                     <span>{msg.suggestedAction.label}</span>
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border-3 border-doodle-black rounded-2xl rounded-tl-none p-4 flex items-center space-x-2 shadow-pop-sm">
              <div className="w-2 h-2 bg-doodle-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-doodle-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-doodle-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions (Floating Chips) */}
      <div className="px-5 py-3 bg-doodle-bg border-t-3 border-doodle-black">
         <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
            {['头脑风暴主题', '设计评价量表', '推荐教学工具'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => { setInput(tag); handleSend(); }} 
                  className="whitespace-nowrap px-4 py-1.5 bg-white border-2 border-doodle-black rounded-full text-xs font-bold text-doodle-black hover:bg-doodle-blue hover:text-white transition-all shadow-pop-sm active:translate-y-0.5 active:shadow-none"
                >
                    {tag}
                </button>
            ))}
         </div>
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t-3 border-doodle-black">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="告诉 AI 你的想法..."
            className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border-3 border-doodle-black rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:shadow-pop-sm transition-all placeholder:text-gray-400 text-doodle-black"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-doodle-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-95"
          >
            <Send size={18} strokeWidth={2.5}/>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, PlusCircle, Bot, X, GripVertical } from 'lucide-react';
import { ChatMessage, PBLComponentData } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface RightPanelProps {
  onAddComponentFromAI: (data: Partial<PBLComponentData>) => void;
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onAddComponentFromAI, onClose }) => {
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
    
    let suggestedAction = undefined;
    if (responseText.includes("驱动性问题") || responseText.includes("核心任务") || responseText.includes("流程")) {
         suggestedAction = {
             label: "添加到画布",
             actionType: 'add-to-canvas' as const,
             data: {
                 category: 'dq-group',
                 title: 'AI 建议组件',
                 type: 'dq-problem',
                 fields: [
                     { id: 'ai-1', label: '摘要', value: responseText.slice(0, 100), type: 'textarea' }
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
    <div className="h-full flex flex-col bg-white border-3 border-doodle-black rounded-[2.5rem] shadow-pop overflow-hidden relative group">
      {/* Notion-style Header with Drag Handle */}
      <div className="h-14 flex items-center px-4 border-b-3 border-doodle-black bg-white shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <Bot size={20} className="text-doodle-blue" />
          <span className="font-black text-xs uppercase tracking-widest text-doodle-black">PBL AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-doodle-black">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-doodle-bg/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 text-xs font-bold border-3 border-doodle-black shadow-pop-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-doodle-black text-white rounded-tr-none' 
                : 'bg-white text-doodle-black rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {msg.role === 'model' && msg.suggestedAction && (
                <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-100">
                   <button 
                     onClick={() => msg.suggestedAction?.data && onAddComponentFromAI(msg.suggestedAction.data)}
                     className="flex items-center space-x-2 text-[10px] font-black text-doodle-black bg-doodle-yellow px-4 py-2.5 rounded-xl border-2 border-doodle-black hover:bg-yellow-300 hover:shadow-pop-sm active:translate-y-0.5 active:shadow-none transition-all w-full justify-center shadow-sm"
                   >
                     <PlusCircle size={14} />
                     <span>{msg.suggestedAction.label}</span>
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border-3 border-doodle-black rounded-2xl rounded-tl-none p-3 flex items-center space-x-2 shadow-pop-sm">
              <div className="w-1.5 h-1.5 bg-doodle-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-doodle-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-doodle-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="px-6 py-3 bg-white border-t-3 border-doodle-black flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth">
          {['头脑风暴主题', '设计评价量表', '优化教学流程'].map(tag => (
              <button 
                key={tag}
                onClick={() => { setInput(tag); handleSend(); }} 
                className="whitespace-nowrap px-4 py-1.5 bg-white border-2 border-doodle-black rounded-xl text-[10px] font-black text-doodle-black hover:bg-doodle-yellow transition-all shadow-pop-sm active:translate-y-0.5 active:shadow-none"
              >
                  {tag}
              </button>
          ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t-3 border-doodle-black">
        <div className="relative group/input">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问问 AI 或输入指令..."
            className="w-full pl-5 pr-14 py-4 bg-gray-50 border-3 border-doodle-black rounded-2xl text-xs font-bold focus:outline-none focus:bg-white focus:shadow-pop-sm transition-all placeholder:text-gray-400 text-doodle-black resize-none overflow-hidden"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-doodle-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-90"
          >
            <Send size={16} strokeWidth={3}/>
          </button>
        </div>
      </div>
    </div>
  );
};

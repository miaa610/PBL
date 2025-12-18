
import React, { useState } from 'react';
import { Trash2, Sparkles, RefreshCw, Plus, Link as LinkIcon, AlertCircle, Edit } from 'lucide-react';
import { PBLComponentData } from '../types';
import { generateComponentResult } from '../services/geminiService';

interface CanvasCardProps {
  data: PBLComponentData;
  allComponents: PBLComponentData[];
  onUpdate: (id: string, updates: Partial<PBLComponentData>) => void;
  onRemove: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onStartLink: (id: string) => void;
  onEndLink: (id: string) => void;
  isLinking: boolean;
  isLinkTarget: boolean;
}

export const CanvasCard: React.FC<CanvasCardProps> = ({ 
  data, allComponents, onUpdate, onRemove, onMouseDown, onStartLink, onEndLink, isLinking, isLinkTarget 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingResult, setIsEditingResult] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateComponentResult(data, allComponents);
    onUpdate(data.id, { result, isRippleActive: true });
    setTimeout(() => onUpdate(data.id, { isRippleActive: false }), 2000);
    setIsGenerating(false);
  };

  const getAccentColor = () => {
    switch(data.category) {
      case 'dq-2.0': return 'bg-doodle-yellow';
      case 'task-component': return 'bg-doodle-purple text-white';
      case 'scaffold-group': return 'bg-doodle-orange';
      case 'assessment-class': return 'bg-doodle-green';
      default: return 'bg-doodle-blue';
    }
  };

  return (
    <div 
      className={`absolute bg-white rounded-3xl border-3 border-doodle-black shadow-pop transition-all w-[340px] group select-none ${isLinkTarget ? 'ring-4 ring-doodle-blue animate-pulse' : ''}`}
      style={{ left: data.x, top: data.y, zIndex: isLinking ? 100 : 10 }}
    >
      {/* 链接锚点 */}
      <button 
        onClick={() => isLinkTarget ? onEndLink(data.id) : onStartLink(data.id)}
        className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-doodle-black transition-all flex items-center justify-center z-50 ${isLinking ? 'bg-doodle-blue text-white scale-125 shadow-sm' : 'bg-white text-gray-400 hover:scale-110 hover:bg-gray-50'}`}
      >
        <LinkIcon size={12} />
      </button>

      {/* 头部 */}
      <div 
        className={`px-4 py-3 cursor-grab active:cursor-grabbing border-b-3 border-doodle-black rounded-t-2xl flex items-center justify-between ${getAccentColor()}`}
        onMouseDown={(e) => onMouseDown(e, data.id)}
      >
        <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm truncate max-w-[200px]">{data.title}</span>
            <span className="text-[10px] opacity-70 font-black uppercase tracking-tighter">
                {data.interactionType === 'parameter' ? '参数式' : data.interactionType === 'generative' ? '生成式' : '节点式'}
            </span>
        </div>
        <button onClick={() => onRemove(data.id)} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"><Trash2 size={16}/></button>
      </div>

      {/* 内容区 */}
      <div className="p-4 space-y-4">
        {data.fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
              {field.label}
              {field.type === 'tags' && <AlertCircle size={8} />}
            </label>
            
            {field.type === 'slider' ? (
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <input 
                  type="range" min={field.range?.[0] || 0} max={field.range?.[1] || 100} 
                  value={field.value} 
                  onChange={(e) => {
                    const newFields = data.fields.map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                    onUpdate(data.id, { fields: newFields });
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-doodle-black"
                />
                <span className="text-xs font-black w-6 text-center">{field.value}</span>
              </div>
            ) : field.type === 'select' ? (
              <select 
                value={field.value}
                onChange={(e) => {
                    const newFields = data.fields.map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                    onUpdate(data.id, { fields: newFields });
                }}
                className="w-full text-xs font-bold p-2 border-2 border-doodle-black rounded-lg bg-white shadow-sm"
              >
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : field.type === 'toggle' ? (
               <button 
                  onClick={() => {
                    const newFields = data.fields.map(f => f.id === field.id ? { ...f, value: f.value === 'true' ? 'false' : 'true' } : f);
                    onUpdate(data.id, { fields: newFields });
                  }}
                  className={`w-12 h-6 rounded-full border-2 border-doodle-black relative transition-colors ${field.value === 'true' ? 'bg-doodle-green' : 'bg-gray-200'}`}
               >
                   <div className={`absolute top-0.5 w-4 h-4 bg-white border-2 border-doodle-black rounded-full transition-all ${field.value === 'true' ? 'left-[24px]' : 'left-0.5'}`} />
               </button>
            ) : (
              <textarea 
                className={`w-full text-xs p-2 border-2 border-doodle-black rounded-lg focus:bg-yellow-50 outline-none resize-none font-bold transition-all shadow-sm ${data.interactionType === 'parameter' ? 'bg-gray-50' : 'bg-white'}`}
                value={field.value}
                placeholder={field.placeholder}
                readOnly={data.interactionType === 'parameter' && field.type !== 'tags'}
                onChange={(e) => {
                  const newFields = data.fields.map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                  onUpdate(data.id, { fields: newFields });
                }}
                rows={field.type === 'textarea' ? 3 : 1}
              />
            )}
          </div>
        ))}

        {/* 任务流展示 */}
        {data.type === 'task-edp' && data.stages && (
            <div className="flex items-center gap-1 py-2 overflow-x-auto hide-scrollbar">
                {data.stages.map((stage, idx) => (
                    <React.Fragment key={stage.id}>
                        <div className="flex flex-col items-center shrink-0">
                            <div className="w-8 h-8 rounded-full bg-doodle-purple border-2 border-doodle-black flex items-center justify-center text-[10px] font-black text-white shadow-pop-sm">
                                {stage.name[0]}
                            </div>
                            <span className="text-[8px] font-black mt-1">{stage.name}</span>
                        </div>
                        {idx < data.stages!.length - 1 && <div className="w-4 h-[2px] bg-doodle-black mb-4"></div>}
                    </React.Fragment>
                ))}
            </div>
        )}

        {/* AI 生成交互区 */}
        {data.interactionType === 'generative' && (
          <div className="pt-2 border-t-2 border-dashed border-gray-100 flex flex-col gap-3">
             <button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full py-2 bg-doodle-yellow border-2 border-doodle-black rounded-xl font-black text-xs shadow-pop-sm flex items-center justify-center gap-2 hover:bg-yellow-300 active:translate-y-0.5 active:shadow-none transition-all"
             >
                {isGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                生成/更新方案
             </button>
             
             {data.result && (
                <div className="relative group/res">
                    {isEditingResult ? (
                        <textarea 
                            autoFocus
                            onBlur={() => setIsEditingResult(false)}
                            className="w-full p-3 bg-white border-2 border-doodle-black rounded-xl text-xs font-medium italic text-gray-700 min-h-[80px]"
                            value={data.result}
                            onChange={(e) => onUpdate(data.id, { result: e.target.value })}
                        />
                    ) : (
                        <div className="p-3 bg-gray-50 border-2 border-doodle-black border-dotted rounded-xl text-xs font-medium italic text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {data.result}
                            <button 
                                onClick={() => setIsEditingResult(true)}
                                className="absolute top-2 right-2 p-1 bg-white border border-gray-300 rounded opacity-0 group-hover/res:opacity-100 transition-opacity"
                            >
                                <Edit size={10}/>
                            </button>
                        </div>
                    )}
                </div>
             )}
          </div>
        )}
      </div>

      {/* 右侧锚点 */}
      <button 
        onClick={() => isLinkTarget ? onEndLink(data.id) : onStartLink(data.id)}
        className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-doodle-black transition-all flex items-center justify-center z-50 ${isLinking ? 'bg-doodle-blue text-white scale-125 shadow-sm' : 'bg-white text-gray-400 hover:scale-110 hover:bg-gray-50'}`}
      >
        <Plus size={12} />
      </button>
    </div>
  );
};

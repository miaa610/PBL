
import React from 'react';
import { X, Save, Sparkles, Layout, Info, Layers, History, Check } from 'lucide-react';
import { PBLComponentData, FieldData } from '../types';

interface DetailSidebarProps {
  component: PBLComponentData;
  onUpdate: (updates: Partial<PBLComponentData>) => void;
  onClose: () => void;
}

export const DetailSidebar: React.FC<DetailSidebarProps> = ({ component, onUpdate, onClose }) => {
  const handleFieldChange = (fieldId: string, value: string) => {
    const newFields = component.fields.map(f => f.id === fieldId ? { ...f, value } : f);
    onUpdate({ fields: newFields });
  };

  const applyHistoryVersion = (versionText: string, index: number) => {
    // 找到最后一个可输入的文本域，将内容替换为历史版本
    const targetFieldIdx = component.fields.findLastIndex(f => f.type === 'textarea' || f.type === 'story-shot');
    const updatedFields = [...component.fields];
    if (targetFieldIdx !== -1) {
      updatedFields[targetFieldIdx] = { ...updatedFields[targetFieldIdx], value: versionText };
    }
    onUpdate({ 
      fields: updatedFields,
      activeResultIndex: index 
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-16 flex items-center justify-between px-6 border-b-3 border-doodle-black bg-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-doodle-black" />
          <h2 className="font-black text-sm uppercase truncate max-w-[200px]">{component.title}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-xl transition-colors border-2 border-transparent hover:border-doodle-black">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-doodle-bg/10">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Layout size={12}/> 核心配置项
          </h3>
          <div className="space-y-5">
            {component.fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-[11px] font-black text-doodle-black pl-1">{field.label}</label>
                {field.type === 'textarea' || field.type === 'story-shot' ? (
                  <textarea 
                    className="w-full text-xs p-3 border-2 border-doodle-black rounded-xl bg-white font-bold min-h-[100px] outline-none focus:ring-2 ring-doodle-yellow/20 shadow-inner"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select 
                    className="w-full text-xs p-3 border-2 border-doodle-black rounded-xl bg-white font-black shadow-sm"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  >
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text"
                    className="w-full text-xs p-3 border-2 border-doodle-black rounded-xl bg-white font-bold outline-none shadow-sm"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {component.results.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <History size={12}/> 生成历史版本
            </h3>
            <div className="space-y-3">
              {component.results.map((res, idx) => (
                <div 
                  key={idx} 
                  onClick={() => applyHistoryVersion(res, idx)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative group ${
                    component.activeResultIndex === idx 
                      ? 'border-doodle-yellow bg-yellow-50 shadow-pop-sm' 
                      : 'border-gray-200 bg-white hover:border-doodle-black hover:shadow-pop-sm'
                  }`}
                >
                  <div className="text-[10px] font-black text-gray-400 mb-1 flex justify-between">
                    <span>版本 #{idx + 1}</span>
                    {component.activeResultIndex === idx && <Check size={12} className="text-doodle-yellow"/>}
                  </div>
                  <div className="text-[11px] leading-relaxed font-bold text-gray-700 line-clamp-3">
                    {res}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="p-6 border-t-3 border-doodle-black bg-white shrink-0">
        <button 
          onClick={onClose}
          className="w-full py-3 bg-doodle-black text-white rounded-2xl font-black text-sm shadow-pop flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none transition-all"
        >
          <Save size={18} /> 保存并关闭
        </button>
      </div>
    </div>
  );
};

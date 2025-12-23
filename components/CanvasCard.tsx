
import React, { useState } from 'react';
import { Trash2, Sparkles, Pin, X, Save, User, Radar, Box, Plus, Minus, Info, Smile, Music, Film, Mic, Target, AlertCircle, RefreshCcw, AlignLeft, Edit3 } from 'lucide-react';
import { PBLComponentData, FieldData } from '../types';
import { generateComponentResult } from '../services/geminiService';

interface CanvasCardProps {
  data: PBLComponentData;
  allComponents: PBLComponentData[];
  onUpdate: (id: string, updates: Partial<PBLComponentData>) => void;
  onRemove: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onStartLink: (id: string, port: 'in' | 'out', portIndex: number) => void;
  onEndLink: (id: string, port: 'in' | 'out', portIndex: number) => void;
  isLinking: boolean;
  linkingFrom: { id: string, port: 'in' | 'out', portIndex: number } | null;
  onOpenDetail: () => void;
}

export const CanvasCard: React.FC<CanvasCardProps> = ({ 
  data, allComponents, onUpdate, onRemove, onMouseDown, onStartLink, onEndLink, isLinking, linkingFrom, onOpenDetail
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const results = data.results || [];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const resultText = await generateComponentResult(data, allComponents);
      
      // 更新主要输入框内容 (通常是最后一个 textarea 或者专门的输出框)
      const targetFieldIdx = data.fields.findLastIndex(f => f.type === 'textarea' || f.type === 'story-shot');
      const updatedFields = [...data.fields];
      if (targetFieldIdx !== -1) {
        updatedFields[targetFieldIdx] = { ...updatedFields[targetFieldIdx], value: resultText };
      }

      onUpdate(data.id, { 
        fields: updatedFields,
        results: [...results, resultText], 
        activeResultIndex: results.length 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPortDefinitions = () => {
    const ports = { in: [] as string[], out: [] as string[] };
    switch(data.type) {
      case 'dq-curriculum': case 'dq-resource': ports.out = ['驱动性问题']; break;
      case 'dq-problem': ports.in = ['驱动性问题']; ports.out = ['情景导入', '目标解析', '设计流程']; break;
      case 'dq-context': ports.in = ['驱动性问题']; break;
      case 'dq-analysis': ports.in = ['目标解析']; break;
      case 'task-edp': ports.in = ['设计流程']; ports.out = ['支持性活动', '支架']; break;
      case 'task-support': ports.in = ['支持性活动']; break;
      case 'scaffold-scamper': case 'scaffold-persona': case 'scaffold-empathy': case 'scaffold-story': case 'scaffold-material':
        ports.in = ['支持性活动']; ports.out = ['评价']; break;
      case 'assess-rubric': ports.in = ['评价']; break;
      default:
        if (data.hasInputs) ports.in = ['输入'];
        if (data.hasOutputs) ports.out = ['输出'];
    }
    return ports;
  };

  const { in: inPorts, out: outPorts } = getPortDefinitions();

  const addDimension = () => {
    const newDim: FieldData = { id: `d${Date.now()}`, label: '维度', value: '新评价维度', type: 'radar-dim', weight: 20 };
    onUpdate(data.id, { fields: [...data.fields.filter(f => f.id !== 'r1'), newDim, data.fields.find(f => f.id === 'r1')!] });
  };

  const removeDimension = (id: string) => {
    onUpdate(data.id, { fields: data.fields.filter(f => f.id !== id) });
  };

  const renderField = (f: FieldData, label?: string) => {
    if (f.type === 'select') {
      return (
        <div key={f.id} className="space-y-0.5">
          <label className="text-[9px] font-black text-gray-400 uppercase block pl-1">{label || f.label}</label>
          <select 
            className="w-full text-xs p-2 border-2 border-doodle-black rounded-lg bg-white font-black shadow-sm"
            value={f.value}
            onChange={(e) => onUpdate(data.id, { fields: data.fields.map(fid => fid.id === f.id ? {...fid, value: e.target.value} : fid) })}
          >
            {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    
    if (f.type === 'slider') {
      const val = parseInt(f.value);
      return (
        <div key={f.id} className="space-y-2 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
          <label className="text-[9px] font-black text-gray-400 uppercase block pl-1">{label || f.label}</label>
          <div className="flex justify-between items-center text-[10px] font-black">
            <span className={val < 33 ? 'text-doodle-blue underline' : 'text-gray-300'}>低</span>
            <span className={val >= 33 && val < 66 ? 'text-doodle-orange underline' : 'text-gray-300'}>中</span>
            <span className={val >= 66 ? 'text-doodle-purple underline' : 'text-gray-300'}>高</span>
          </div>
          <input 
            type="range" className="w-full h-2 bg-gray-200 rounded-full appearance-none accent-doodle-black cursor-pointer" 
            value={f.value} 
            onChange={(e) => onUpdate(data.id, { fields: data.fields.map(fid => fid.id === f.id ? {...fid, value: e.target.value} : fid)})} 
          />
        </div>
      );
    }

    if (f.type === 'radar-dim') {
      return (
        <div key={f.id} className="flex flex-col mb-3 group/dim bg-white p-2 rounded-xl border-2 border-gray-100 shadow-sm">
          <div className="flex justify-between px-1 mb-1">
            <span className="text-[8px] font-black text-gray-400 uppercase">评价维度</span>
            <span className="text-[8px] font-black text-gray-400 uppercase">权重比</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              className="bg-transparent text-[11px] font-black w-28 border-b-2 border-transparent focus:border-doodle-black outline-none" 
              value={f.value} 
              onChange={(e) => onUpdate(data.id, { fields: data.fields.map(fid => fid.id === f.id ? {...fid, value: e.target.value} : fid)})} 
            />
            <input 
              type="range" className="flex-1 h-2 bg-gray-100 rounded-full appearance-none accent-doodle-green" 
              value={f.weight} 
              onChange={(e) => onUpdate(data.id, { fields: data.fields.map(fid => fid.id === f.id ? {...fid, weight: parseInt(e.target.value)} : fid)})} 
            />
            <span className="text-[10px] font-black w-8 text-right">{f.weight}%</span>
            <button onClick={() => removeDimension(f.id)} className="opacity-0 group-hover/dim:opacity-100 p-1 text-red-500 hover:scale-110 transition-all"><Minus size={12}/></button>
          </div>
        </div>
      );
    }

    return (
      <div key={f.id} className="space-y-0.5">
        {(label || f.label) && <label className="text-[9px] font-black text-gray-400 uppercase block pl-1">{label || f.label}</label>}
        <textarea 
          onDoubleClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
          placeholder={f.placeholder || f.label}
          className="w-full text-[11px] p-2 border-2 border-doodle-black rounded-xl bg-gray-50 focus:bg-white outline-none resize-none font-bold transition-all shadow-inner min-h-[40px]" 
          value={f.value} 
          onChange={(e) => onUpdate(data.id, { fields: data.fields.map(fid => fid.id === f.id ? {...fid, value: e.target.value} : fid) })} 
          rows={f.type === 'textarea' ? 3 : 1}
        />
      </div>
    );
  };

  const renderVisualTool = () => {
    if (data.type === 'scaffold-empathy') {
      const getF = (label: string) => data.fields.find(f => f.label === label);
      return (
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-white border-3 border-doodle-black rounded-[2rem] overflow-hidden p-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-28 h-28 bg-white border-3 border-doodle-black rounded-full flex flex-col items-center justify-center shadow-pop-sm">
                <Smile size={32} className="text-doodle-black mb-1" />
                <span className="text-[9px] font-black uppercase">核心角色</span>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-dashed border-gray-100 rotate-45 transform origin-center scale-150"></div>
              <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-dashed border-gray-200 -rotate-45 transform origin-center scale-150"></div>
            </div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center w-40 z-20">
              <span className="text-[9px] font-black uppercase text-gray-400 mb-1 block">想法 & 感受?</span>
              <textarea onDoubleClick={onOpenDetail} value={getF('想法&感受')?.value} onChange={(e)=>onUpdate(data.id, {fields: data.fields.map(f=>f.label==='想法&感受'?{...f, value: e.target.value}:f)})} className="w-full text-[10px] bg-yellow-50/50 border-2 border-dashed border-doodle-black p-2 rounded-xl outline-none font-bold resize-none" rows={3}/>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-40 z-20">
              <span className="text-[9px] font-black uppercase text-gray-400 mb-1 block">说 & 做?</span>
              <textarea onDoubleClick={onOpenDetail} value={getF('说&做')?.value} onChange={(e)=>onUpdate(data.id, {fields: data.fields.map(f=>f.label==='说&做'?{...f, value: e.target.value}:f)})} className="w-full text-[10px] bg-blue-50/50 border-2 border-dashed border-doodle-black p-2 rounded-xl outline-none font-bold resize-none" rows={3}/>
            </div>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-center w-32 z-20">
              <span className="text-[9px] font-black uppercase text-gray-400 mb-1 block">听?</span>
              <textarea onDoubleClick={onOpenDetail} value={getF('所听')?.value} onChange={(e)=>onUpdate(data.id, {fields: data.fields.map(f=>f.label==='所听'?{...f, value: e.target.value}:f)})} className="w-full text-[10px] bg-orange-50/50 border-2 border-dashed border-doodle-black p-2 rounded-xl outline-none font-bold resize-none" rows={3}/>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-center w-32 z-20">
              <span className="text-[9px] font-black uppercase text-gray-400 mb-1 block">看?</span>
              <textarea onDoubleClick={onOpenDetail} value={getF('所见')?.value} onChange={(e)=>onUpdate(data.id, {fields: data.fields.map(f=>f.label==='所见'?{...f, value: e.target.value}:f)})} className="w-full text-[10px] bg-green-50/50 border-2 border-dashed border-doodle-black p-2 rounded-xl outline-none font-bold resize-none" rows={3}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-red-50 border-3 border-doodle-black rounded-2xl shadow-pop-sm">
                <span className="text-[10px] font-black uppercase mb-1 block text-red-600">痛点</span>
                <textarea onDoubleClick={onOpenDetail} value={getF('痛点')?.value} onChange={(e)=>onUpdate(data.id, {fields: data.fields.map(f=>f.label==='痛点'?{...f, value: e.target.value}:f)})} className="w-full text-[10px] bg-white/50 border-2 border-dashed border-red-200 rounded-xl outline-none font-bold p-2" rows={3}/>
             </div>
             <div className="p-3 bg-green-50 border-3 border-doodle-black rounded-2xl shadow-pop-sm">
                <span className="text-[10px] font-black uppercase mb-1 block text-green-600">收获</span>
                <textarea onDoubleClick={onOpenDetail} value={getF('收获')?.value} onChange={(e)=>onUpdate(data.id, {fields: data.fields.map(f=>f.label==='收获'?{...f, value: e.target.value}:f)})} className="w-full text-[10px] bg-white/50 border-2 border-dashed border-green-200 rounded-xl outline-none font-bold p-2" rows={3}/>
             </div>
          </div>
        </div>
      );
    }

    if (data.type === 'scaffold-persona') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-doodle-blue/10 p-4 rounded-3xl border-3 border-doodle-black shadow-pop-sm">
            <div className="w-16 h-16 bg-white border-3 border-doodle-black rounded-2xl flex items-center justify-center text-doodle-black shrink-0 shadow-inner">
               <User size={32} />
            </div>
            <div className="flex-1">
               <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">姓名/角色</label>
               <input 
                 onDoubleClick={onOpenDetail}
                 className="w-full bg-white border-2 border-doodle-black px-2 py-1 text-sm font-black focus:outline-none rounded-lg" 
                 value={data.fields.find(f => f.label === '姓名')?.value}
                 onChange={(e) => onUpdate(data.id, { fields: data.fields.map(f => f.label === '姓名' ? {...f, value: e.target.value} : f) })}
               />
            </div>
          </div>
          <div className="space-y-3">
             {data.fields.filter(f => f.label !== '姓名').map(f => renderField(f))}
          </div>
        </div>
      );
    }

    if (data.type === 'scaffold-scamper') {
      const scamperItems = [
        { l: 'S', t: '替代 Substitute' },
        { l: 'C', t: '结合 Combine' },
        { l: 'A', t: '调整 Adapt' },
        { l: 'M', t: '修改 Modify' },
        { l: 'P', t: '另作他用 Put to other uses' },
        { l: 'E', t: '取消 Eliminate' },
        { l: 'R', t: '反转 Reverse' }
      ];
      return (
        <div className="space-y-2">
          {scamperItems.map(item => {
            const field = data.fields.find(f => f.label === item.l) || {id: '', value: ''};
            return (
              <div key={item.l} className="flex gap-2 items-start mb-2">
                <div className="w-7 h-7 rounded-lg bg-doodle-yellow border-2 border-doodle-black flex items-center justify-center font-black text-[10px] shrink-0 mt-5">{item.l}</div>
                <div className="flex-1">
                   <label className="text-[9px] font-black text-gray-400 uppercase block mb-1 pl-1">{item.t}</label>
                   <textarea 
                     onDoubleClick={onOpenDetail}
                     className="w-full text-[10px] p-2 bg-gray-50 border-2 border-doodle-black rounded-xl outline-none font-bold focus:bg-white transition-all"
                     placeholder={item.t}
                     value={field.value}
                     onChange={(e) => onUpdate(data.id, { fields: data.fields.map(f => f.label === item.l ? {...f, value: e.target.value} : f) })}
                     rows={1}
                   />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (data.type === 'scaffold-story') {
      return (
        <div className="space-y-6">
           {data.fields.filter(f => f.type === 'story-shot').map((f, i) => (
             <div key={f.id} className="bg-white border-3 border-doodle-black rounded-[2.5rem] overflow-hidden shadow-pop-sm">
                <div className="bg-doodle-yellow px-6 py-2 border-b-3 border-doodle-black flex justify-between text-[10px] font-black uppercase">
                   <div className="flex gap-6">
                      <span className="flex items-center gap-1">场景: {i+1}</span>
                      <span className="flex items-center gap-1">时间: <input className="w-12 bg-transparent outline-none border-b-2 border-black/20 focus:border-black" placeholder="00:15"/></span>
                   </div>
                   <button onClick={() => onUpdate(data.id, {fields: data.fields.filter(fid => fid.id !== f.id)})} className="text-red-600 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                </div>
                <div className="h-40 bg-gray-50 border-b-3 border-doodle-black flex items-center justify-center group relative">
                   <Film size={32} className="text-gray-200" />
                   <span className="absolute bottom-4 text-[9px] font-black text-gray-300 uppercase">画面构思区</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    {renderField(data.fields.find(fid => fid.id === f.id)!, '画面描述')}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase block pl-1">脚本/对白</label>
                        <textarea onDoubleClick={onOpenDetail} className="w-full text-[10px] font-bold p-2 bg-gray-50 border-2 border-doodle-black rounded-xl h-20 outline-none" placeholder="输入对话..."/>
                    </div>
                </div>
             </div>
           ))}
           <button onClick={() => {
             const newId = Date.now().toString();
             onUpdate(data.id, { fields: [...data.fields, { id: newId, label: `场景 ${data.fields.length+1}`, value: '', type: 'story-shot' }] });
           }} className="w-full py-4 border-4 border-dashed border-gray-200 rounded-[2.5rem] flex items-center justify-center gap-2 text-gray-400 font-black hover:bg-white hover:border-doodle-black hover:text-doodle-black transition-all shadow-sm">
             <Plus size={20}/> 添加场景
           </button>
        </div>
      );
    }

    if (data.type === 'assess-rubric') {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border-2 border-doodle-black">
             <span className="text-[10px] font-black text-doodle-black uppercase pl-2">维度调节</span>
             <button onClick={addDimension} className="px-3 py-1 bg-doodle-green border-2 border-doodle-black rounded-lg text-white font-black text-[10px] flex items-center gap-1 shadow-pop-sm"><Plus size={12}/> 新增</button>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
             {data.fields.filter(f => f.type === 'radar-dim').map(f => renderField(f))}
          </div>
          {renderField(data.fields.find(f => f.id === 'r1')!)}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.fields.map(f => renderField(f))}
      </div>
    );
  }

  return (
    <>
      <div className="absolute" style={{ left: data.x, top: data.y, zIndex: isLinking ? 100 : 10 }}>
        <div className={`bg-white border-3 border-doodle-black rounded-[2.5rem] shadow-pop transition-all group min-h-[140px] ${['assess-rubric', 'scaffold-story', 'scaffold-persona', 'scaffold-empathy'].includes(data.type) ? 'w-[540px]' : 'w-[320px]'}`}>
          <div className={`px-5 py-3 cursor-grab active:cursor-grabbing rounded-t-[2.3rem] flex items-center justify-between font-black text-[12px] border-b-3 border-doodle-black ${data.category === 'dq-group' ? 'bg-doodle-yellow' : data.category === 'task-group' ? 'bg-doodle-orange' : data.category === 'scaffold-group' ? 'bg-doodle-blue' : 'bg-doodle-green'}`} onMouseDown={(e) => onMouseDown(e, data.id)}>
            <span className="truncate pr-2 uppercase tracking-tight">{data.title}</span>
            <button onClick={() => onRemove(data.id)} className="p-1.5 hover:bg-black/10 rounded-xl transition-all"><Trash2 size={14}/></button>
          </div>

          <div className="flex flex-row relative">
            <div className="flex flex-col py-6 w-6 shrink-0 gap-8">
              {inPorts.map((label, idx) => (
                <div key={idx} className="flex items-center relative group/port">
                   <div onClick={(e) => { e.stopPropagation(); if (isLinking && linkingFrom?.port === 'out') onEndLink(data.id, 'in', idx); else onStartLink(data.id, 'in', idx); }} className={`w-4 h-4 rounded-full border-3 border-doodle-black -ml-[10px] cursor-crosshair transition-all z-20 hover:scale-125 hover:bg-doodle-yellow ${isLinking && linkingFrom?.id === data.id && linkingFrom?.port === 'in' && linkingFrom?.portIndex === idx ? 'bg-doodle-blue animate-pulse' : 'bg-white'}`} />
                   <span className="absolute left-6 bg-doodle-black text-white text-[9px] font-black px-2 py-0.5 rounded shadow-pop-sm opacity-0 group-hover/port:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 p-5">
              {renderVisualTool()}
              
              {data.interactionType === 'generative' && (
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-4 py-3 bg-doodle-yellow hover:bg-yellow-300 border-3 border-doodle-black rounded-2xl font-black text-[11px] shadow-pop-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-1">
                   {isGenerating ? "AI 思考中..." : <><Sparkles size={14}/> {results.length > 0 ? '重新构思' : 'AI 辅助生成'}</>}
                </button>
              )}
            </div>

            <div className="flex flex-col py-6 w-6 shrink-0 gap-8 items-end">
              {outPorts.map((label, idx) => (
                <div key={idx} className="flex items-center relative group/port">
                   <span className="absolute right-6 bg-doodle-black text-white text-[9px] font-black px-2 py-0.5 rounded shadow-pop-sm opacity-0 group-hover/port:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">{label}</span>
                   <div onClick={(e) => { e.stopPropagation(); if (isLinking && linkingFrom?.port === 'in') onEndLink(data.id, 'out', idx); else onStartLink(data.id, 'out', idx); }} className={`w-4 h-4 rounded-full border-3 border-doodle-black -mr-[10px] cursor-crosshair transition-all z-20 hover:scale-125 hover:bg-doodle-yellow ${isLinking && linkingFrom?.id === data.id && linkingFrom?.port === 'out' && linkingFrom?.portIndex === idx ? 'bg-doodle-blue animate-pulse' : 'bg-white'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

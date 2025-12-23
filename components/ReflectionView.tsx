
import React, { useState, useEffect } from 'react';
import { Activity, Package, Image as ImageIcon, Sparkles, CheckCircle, RefreshCcw, TrendingUp, AlertCircle, Save, ArrowRight, Star, Layers, Calendar, ChevronDown, Eye, PenTool } from 'lucide-react';
import { TimelineEvent, GalleryItem, GroupMessage, PBLComponentData } from '../types';
import { generateReflectionDiagnosis, generateClassGalleryInsights } from '../services/geminiService';

interface ReflectionViewProps {
  components: PBLComponentData[];
  onPromoteAsset: (asset: GroupMessage) => void;
  onUpdateDesign: (diagnosis: string) => void;
}

const MOCK_LESSONS = [
  { id: 'l1', name: '第一课：问题界定与需求分析', date: '2023-10-10' },
  { id: 'l2', name: '第二课：概念生成与设计草图', date: '2023-10-17' },
  { id: 'l3', name: '第三课：原型制作与材料实验', date: '2023-10-24' },
];

const MOCK_EVENTS: TimelineEvent[] = [
  { id: 'e1', stageId: 'emp', plannedMinutes: 10, actualMinutes: 12, helpRequests: 2 },
  { id: 'e2', stageId: 'def', plannedMinutes: 15, actualMinutes: 14, helpRequests: 1 },
  { id: 'e3', stageId: 'ide', plannedMinutes: 20, actualMinutes: 45, helpRequests: 12 },
  { id: 'e4', stageId: 'pro', plannedMinutes: 40, actualMinutes: 38, helpRequests: 3 },
  { id: 'e5', stageId: 'tes', plannedMinutes: 15, actualMinutes: 20, helpRequests: 5 },
];

const MOCK_GALLERY: GalleryItem[] = [
  { id: 'i1', groupId: 'g1', groupName: '探索者小队', imageUrl: 'https://images.unsplash.com/photo-1510172951991-856a654063f9?w=400', description: '硬纸板与塑料瓶结合的底座原型', aiScore: 8.5, aiFeedback: '结构稳固，材料利用极具创意。' },
  { id: 'i2', groupId: 'g2', groupName: '火箭工程队', imageUrl: 'https://images.unsplash.com/photo-1544333346-6466f21bc942?w=400', description: '防水涂层测试草图', aiScore: 7.2, aiFeedback: '物理逻辑清晰，但防水细节有待加强。' },
  { id: 'i3', groupId: 'g3', groupName: '未来创造者', imageUrl: 'https://images.unsplash.com/photo-1554475900-0a0350e3fc7b?w=400', description: '3D打印构件设计图', aiScore: 9.0, aiFeedback: '专业度极高，体现了深厚的建模功底。' },
];

const MOCK_AD_HOC: GroupMessage[] = [
  { id: 'ah1', sender: '教师', text: '这是一个决策矩阵模板，大家可以参考来选择最佳方案。', timestamp: '10:45', isAdHoc: true },
  { id: 'ah2', sender: '教师', text: '防水测试三级标准：轻微、中度、全浸泡。', timestamp: '11:20', isAdHoc: true },
];

export const ReflectionView: React.FC<ReflectionViewProps> = ({ components, onPromoteAsset, onUpdateDesign }) => {
  const [activeLessonId, setActiveLessonId] = useState(MOCK_LESSONS[0].id);
  const [events, setEvents] = useState<TimelineEvent[]>(MOCK_EVENTS);
  const [gallery, setGallery] = useState<GalleryItem[]>(MOCK_GALLERY);
  const [adHocAssets, setAdHocAssets] = useState<GroupMessage[]>(MOCK_AD_HOC);
  const [classInsight, setClassInsight] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      const insight = await generateClassGalleryInsights(gallery);
      setClassInsight(insight);
    };
    loadInsights();
  }, [activeLessonId]);

  const handleDiagnosis = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && !event.aiDiagnosis) {
      const diag = await generateReflectionDiagnosis(event);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, aiDiagnosis: diag } : e));
    }
    setSelectedEventId(eventId);
  };

  // 计算总分钟数以平衡比例
  const totalPlannedMinutes = events.reduce((acc, e) => acc + e.plannedMinutes, 0);
  const totalActualMinutes = events.reduce((acc, e) => acc + e.actualMinutes, 0);
  const maxTotal = Math.max(totalPlannedMinutes, totalActualMinutes);

  return (
    <div className="h-full bg-doodle-bg p-8 overflow-y-auto custom-scrollbar space-y-12 pb-20">
      
      {/* 课程选择器 */}
      <div className="flex items-center gap-4 bg-white border-3 border-doodle-black p-4 rounded-2xl shadow-pop-sm">
        <Calendar size={20} className="text-doodle-blue" />
        <span className="font-black text-xs uppercase">当前复盘课程:</span>
        <div className="relative">
          <select 
            value={activeLessonId}
            onChange={(e) => setActiveLessonId(e.target.value)}
            className="appearance-none bg-gray-50 border-2 border-doodle-black px-4 py-2 rounded-xl text-xs font-black pr-10 cursor-pointer outline-none hover:bg-white transition-colors"
          >
            {MOCK_LESSONS.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.date})</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={16}/>
        </div>
      </div>

      {/* 模块 1: 教学复盘 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-doodle-blue rounded-xl border-2 border-doodle-black shadow-pop-sm">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-doodle-black">教学复盘</h2>
              <p className="text-sm text-gray-500 font-bold uppercase">宏观回顾与微观诊断</p>
            </div>
          </div>
          <button onClick={() => onUpdateDesign("全班在构思环节普遍超时，已自动建议延长原教案该环节时间。")} className="px-6 py-2 bg-doodle-black text-white rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all active:translate-y-0.5">
            <RefreshCcw size={16}/> 同步优化原教案
          </button>
        </div>

        <div className="bg-white border-3 border-doodle-black rounded-[2.5rem] p-8 shadow-pop relative overflow-hidden">
          <div className="space-y-12 overflow-x-auto no-scrollbar custom-scrollbar pb-4">
            {/* 设计路径 - 这里的尺子逻辑进行了优化，确保 Web 端比例一致 */}
            <div className="relative min-w-[800px]">
              <span className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-gray-300 uppercase tracking-widest">设计</span>
              <div className="flex h-12 gap-1.5 pl-6">
                {events.map(e => (
                  <div key={e.id} className="h-full bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm transition-all" style={{ width: `${(e.plannedMinutes / maxTotal) * 100}%`, minWidth: '60px' }}>
                    {e.plannedMinutes}m
                  </div>
                ))}
              </div>
            </div>
            {/* 实际路径 */}
            <div className="relative min-w-[800px]">
              <span className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-doodle-black uppercase tracking-widest">实际</span>
              <div className="flex h-16 gap-1.5 pl-6">
                {events.map(e => {
                  const isGap = Math.abs(e.actualMinutes - e.plannedMinutes) > 5;
                  return (
                    <div 
                      key={e.id} 
                      onClick={() => handleDiagnosis(e.id)}
                      className={`h-full border-3 border-doodle-black rounded-xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-pop-sm relative group ${isGap ? 'bg-red-100' : 'bg-doodle-green'}`} 
                      style={{ width: `${(e.actualMinutes / maxTotal) * 100}%`, minWidth: '60px' }}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-xs font-black">{e.actualMinutes}m</span>
                        {e.helpRequests > 5 && <span className="absolute -top-3 -right-3 p-1.5 bg-red-500 text-white rounded-full border-2 border-doodle-black shadow-sm z-10"><AlertCircle size={12}/></span>}
                      </div>
                      {isGap && <div className="absolute inset-0 bg-red-400/20 animate-pulse pointer-events-none rounded-xl" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedEventId && (
            <div className="mt-8 p-6 bg-yellow-50 border-3 border-doodle-black rounded-2xl animate-in slide-in-from-bottom-4 shadow-inner">
              <div className="flex items-start gap-4">
                <Sparkles className="text-doodle-yellow shrink-0 mt-1" size={24}/>
                <div>
                   <h4 className="font-black text-sm mb-2 text-doodle-black">AI 环节诊断报告</h4>
                   <p className="text-sm font-medium text-gray-700 italic leading-relaxed">
                      {events.find(e => e.id === selectedEventId)?.aiDiagnosis || "正在分析数据差异，请稍候..."}
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 模块 2: 资产回收站 */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-doodle-orange rounded-xl border-2 border-doodle-black shadow-pop-sm text-white">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-doodle-black">资产回收站</h2>
            <p className="text-sm text-gray-500 font-bold uppercase">将课堂灵感转化为可复用的教学组件</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adHocAssets.map(asset => (
            <div key={asset.id} className="bg-white border-3 border-doodle-black rounded-2xl p-5 shadow-pop-sm flex items-center justify-between group hover:-translate-y-1 transition-all">
              <div className="space-y-2 max-w-[70%]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black uppercase">即时支架</span>
                  <span className="text-[9px] text-gray-400 font-bold">{asset.timestamp}</span>
                </div>
                <p className="text-xs font-bold text-gray-700 line-clamp-2">{asset.text}</p>
              </div>
              <button 
                onClick={() => {
                  onPromoteAsset(asset);
                  setAdHocAssets(prev => prev.filter(a => a.id !== asset.id));
                }}
                className="p-3 bg-white border-2 border-doodle-black rounded-xl hover:bg-doodle-orange hover:text-white transition-all shadow-pop-sm active:translate-y-0.5"
                title="保存到构件库"
              >
                <Save size={20} />
              </button>
            </div>
          ))}
          {adHocAssets.length === 0 && (
            <div className="col-span-2 py-10 text-center border-3 border-dashed border-gray-200 rounded-3xl bg-white/50">
              <p className="text-sm font-bold text-gray-400">暂无待沉淀教学资产</p>
            </div>
          )}
        </div>
      </section>

      {/* 模块 3: 学生作品画廊 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-doodle-green rounded-xl border-2 border-doodle-black shadow-pop-sm text-white">
              <ImageIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-doodle-black">学生作品画廊</h2>
              <p className="text-sm text-gray-500 font-bold uppercase">自动化 AI 评估与成果展示</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400">全班平均分</span>
            <span className="text-2xl font-display font-black text-doodle-green">8.2</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gallery.map(item => (
            <div key={item.id} className="bg-white border-3 border-doodle-black rounded-[2rem] overflow-hidden shadow-pop hover:-translate-y-2 transition-all flex flex-col group">
              <div className="h-48 overflow-hidden relative">
                <img src={item.imageUrl} alt={item.groupName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white border-2 border-doodle-black px-3 py-1 rounded-full font-black text-xs shadow-pop-sm">
                   评分: {item.aiScore}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <h4 className="font-black text-lg text-doodle-black">{item.groupName}</h4>
                <p className="text-xs text-gray-500 font-medium italic">"{item.aiFeedback}"</p>
                <div className="mt-auto pt-4 border-t border-dashed border-gray-100 flex gap-2">
                   <button className="flex-1 py-2 bg-doodle-green border-2 border-doodle-black rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-green-400 transition-colors shadow-pop-sm active:translate-y-0.5">
                     <Eye size={14}/> 查看
                   </button>
                   <button className="flex-1 py-2 bg-white border-2 border-doodle-black rounded-xl text-[10px] font-black hover:bg-gray-100 transition-colors shadow-pop-sm active:translate-y-0.5">
                     评分
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-doodle-black text-white p-8 rounded-[2.5rem] border-3 border-doodle-black shadow-pop-sm relative">
           <div className="absolute -top-4 -right-4 w-20 h-20 bg-doodle-yellow rounded-full border-3 border-doodle-black flex items-center justify-center -rotate-12 shadow-pop-sm">
              <Star size={32} className="text-white fill-current" />
           </div>
           <h3 className="text-xl font-display font-black mb-4 flex items-center gap-3">
             <TrendingUp size={24} className="text-doodle-green"/> 全班表现洞察
           </h3>
           <p className="text-sm font-medium leading-relaxed opacity-90">
             {classInsight || "正在利用 AI 引擎整理全班教学成果..."}
           </p>
        </div>
      </section>

    </div>
  );
};


import React, { useState } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { MiddleCanvas } from './components/MiddleCanvas';
import { RightPanel } from './components/RightPanel';
import { LandingPage } from './components/LandingPage';
import { TeachingDashboard } from './components/TeachingDashboard';
import { PBLComponentData, ResourceItem, ComponentCategory, ResourceCategory, Connection } from './types';
import { PenTool, Send, MonitorPlay, ChevronLeft, Grid as GridIcon, MoreVertical, Copy, QrCode, Users, RefreshCw } from 'lucide-react';

type ViewState = 'landing' | 'catalog' | 'workspace';
type WorkspaceTab = 'design' | 'distribute' | 'teach';

function App() {
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('design');
  // Fixed: Updated initial activeCategory to a valid ComponentCategory
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('dq-2.0');
  
  const [components, setComponents] = useState<PBLComponentData[]>([
    {
      id: 'dq-1',
      x: 100,
      y: 100,
      // Fixed: Updated category to a valid ComponentCategory
      category: 'dq-2.0',
      interactionType: 'generative',
      title: '驱动问题生成',
      type: 'dq-forward',
      fields: [
         { id: 'f1', label: '学习目标', value: '结构稳定性', type: 'text' },
         { id: 'f2', label: '重要性', value: '安全保障', type: 'text' },
      ],
      result: '我们如何利用废旧材料设计既防水又坚固的避雨屋？',
      isExpanded: true
    }
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);

  const addComponent = (item: ResourceItem, category: ResourceCategory) => {
      const x = 300 + (Math.random() * 50);
      const y = 200 + (Math.random() * 50);

      const newComponent: PBLComponentData = {
        id: Date.now().toString(),
        x,
        y,
        category: category.id,
        interactionType: item.interactionType,
        title: item.title,
        type: item.type,
        fields: item.defaultFields.map(f => ({...f})),
        result: '',
        isExpanded: true,
        stages: item.stages ? JSON.parse(JSON.stringify(item.stages)) : undefined,
        // Fixed: Removed coreTaskType as it doesn't exist on PBLComponentData or ResourceItem
      };

      setComponents(prev => [...prev, newComponent]);
      setActiveCategory(category.id);
  };

  const addComponentFromAI = (data: Partial<PBLComponentData>) => {
      const newComp: PBLComponentData = {
          id: Date.now().toString(),
          x: 400,
          y: 300,
          // Fixed: Updated fallback to a valid ComponentCategory
          category: data.category || 'scaffold-group',
          interactionType: data.interactionType || 'generative',
          title: data.title || 'AI 建议节点',
          type: data.type || 'generic',
          fields: data.fields || [],
          result: data.result || '',
          isExpanded: true,
      };
      setComponents(prev => [...prev, newComp]);
  };

  if (viewState === 'landing') return <LandingPage onStart={() => setViewState('catalog')} />;

  if (viewState === 'catalog') {
      return (
          <div className="min-h-screen bg-doodle-bg p-8 font-sans overflow-y-auto">
              <header className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-doodle-black rounded-xl flex items-center justify-center text-white">
                         <GridIcon />
                     </div>
                     <h1 className="text-3xl font-display font-black text-doodle-black">课程库</h1>
                  </div>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  <div onClick={() => setViewState('workspace')} className="group bg-white rounded-3xl border-3 border-doodle-black shadow-pop hover:-translate-y-2 transition-all cursor-pointer overflow-hidden flex flex-col h-80 relative">
                      <div className="h-2/5 bg-doodle-yellow border-b-3 border-doodle-black flex items-center justify-center">
                          <span className="text-4xl">🐱</span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                          <h3 className="font-black text-xl text-doodle-black mb-2">流浪猫避雨屋项目</h3>
                          <p className="text-sm text-gray-500 font-bold mb-4">工程设计 · 结构力学</p>
                          <div className="mt-auto flex justify-between items-center">
                              <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-black border-2 border-green-200">编辑中</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden font-sans text-slate-800 bg-white">
      <header className="h-16 bg-white border-b-3 border-doodle-black flex items-center justify-between px-4 z-50 shrink-0">
          <div className="flex items-center gap-4">
              <button onClick={() => setViewState('catalog')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft size={24} className="text-doodle-black"/>
              </button>
              <h1 className="font-black text-lg text-doodle-black">流浪猫避雨屋</h1>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex bg-gray-100 p-1.5 rounded-xl border-2 border-doodle-black">
              <NavTab active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<PenTool size={18}/>} label="设计" />
              <NavTab active={activeTab === 'distribute'} onClick={() => setActiveTab('distribute')} icon={<Send size={18}/>} label="分发" />
              <NavTab active={activeTab === 'teach'} onClick={() => setActiveTab('teach')} icon={<MonitorPlay size={18}/>} label="授课" />
          </div>
          <MoreVertical size={20} className="text-gray-400" />
      </header>

      <div className="flex-1 flex overflow-hidden relative">
          {activeTab === 'teach' ? (
              <TeachingDashboard components={components} setComponents={setComponents} onSwitchToDesign={() => setActiveTab('design')} />
          ) : activeTab === 'distribute' ? (
              <div className="w-full h-full bg-doodle-bg flex items-center justify-center p-8">
                  <div className="max-w-4xl w-full bg-white rounded-[2rem] border-3 border-doodle-black shadow-pop p-10 flex flex-col md:flex-row gap-10">
                      <div className="flex-1 space-y-8">
                          <h2 className="text-3xl font-display font-black text-doodle-black">小组通行码</h2>
                          <div className="bg-yellow-50 border-3 border-doodle-black border-dashed rounded-2xl p-6 text-6xl font-black text-center tracking-widest font-mono">8X92B</div>
                          <button className="w-full py-3 bg-doodle-black text-white rounded-xl font-bold flex items-center justify-center gap-2"><Copy size={18}/> 复制链接</button>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center"><QrCode size={180} className="text-doodle-black mb-4"/><p className="font-bold text-gray-500">展示给学生扫码</p></div>
                  </div>
              </div>
          ) : (
            <>
                <div className="w-[280px] h-full z-10 shadow-[1px_0_15px_rgba(0,0,0,0.03)] bg-white shrink-0">
                    <LeftPanel onAddComponent={addComponent} activeCategory={activeCategory} />
                </div>
                <div className="flex-1 h-full z-0 relative min-w-0">
                    <MiddleCanvas 
                        components={components} 
                        setComponents={setComponents}
                        connections={connections}
                        setConnections={setConnections}
                        onNavigate={(cat) => setActiveCategory(cat)} 
                        appMode={'design'} 
                        setAppMode={() => {}} 
                    />
                </div>
                <div className="w-[320px] h-full z-10 shadow-[-1px_0_15px_rgba(0,0,0,0.03)] border-l border-slate-200 bg-white shrink-0">
                    <RightPanel onAddComponentFromAI={addComponentFromAI} />
                </div>
            </>
          )}
      </div>
    </div>
  );
}

const NavTab = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-black transition-all ${active ? 'bg-doodle-black text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}>
        {icon} <span className="hidden lg:inline whitespace-nowrap">{label}</span>
    </button>
)

export default App;

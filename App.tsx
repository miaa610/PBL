
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { MiddleCanvas } from './components/MiddleCanvas';
import { RightPanel } from './components/RightPanel';
import { LandingPage } from './components/LandingPage';
import { TeachingDashboard } from './components/TeachingDashboard';
import { ReflectionView } from './components/ReflectionView';
import { DetailSidebar } from './components/DetailSidebar';
import { PBLComponentData, ResourceItem, ComponentCategory, ResourceCategory, Connection, GroupMessage } from './types';
import { PenTool, Send, MonitorPlay, ChevronLeft, Grid as GridIcon, MoreVertical, Copy, QrCode, RefreshCcw, Layout, Sidebar, MessageSquareText, Plus, GripVertical } from 'lucide-react';

type ViewState = 'landing' | 'catalog' | 'workspace';
type WorkspaceTab = 'design' | 'distribute' | 'teach' | 'reflect';

function App() {
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('design');
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('dq-group');
  
  const [isLeftVisible, setIsLeftVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCompForDetail, setSelectedCompForDetail] = useState<string | null>(null);

  // 面板宽度调整状态
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const [projects, setProjects] = useState([
    { id: 'p1', title: '流浪猫避雨屋项目', subject: '工程设计 · 结构力学', icon: '🐱', status: '编辑中' }
  ]);

  const [components, setComponents] = useState<PBLComponentData[]>([
    {
      id: 'dq-1',
      x: 350,
      y: 150,
      category: 'dq-group',
      nodeType: 'processor',
      interactionType: 'generative',
      title: '驱动型问题生成',
      type: 'dq-problem',
      fields: [
         { id: 'f1', label: '角色', value: '环保小工程师', type: 'text' },
         { id: 'f2', label: '行动', value: '设计节能照明方案', type: 'text' },
         { id: 'f3', label: '对象', value: '社区街道', type: 'text' },
         { id: 'f4', label: '目的', value: '降低碳排放', type: 'text' },
         { id: 'f5', label: '驱动型问题 (HMW)', value: '我们作为环保小工程师，如何能设计出一套社区街道节能照明方案，来降低碳排放并提升居民夜间安全感？', type: 'textarea' },
      ],
      result: '我们作为环保小工程师，如何能设计出一套社区街道节能照明方案，来降低碳排放并提升居民夜间安全感？',
      results: ['我们作为环保小工程师，如何能设计出一套社区街道节能照明方案，来降低碳排放并提升居民夜间安全感？'],
      activeResultIndex: 0,
      pinnedResultIndex: 0,
      isExpanded: true,
      hasInputs: true,
      hasOutputs: true
    }
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingLeft) {
      setLeftPanelWidth(Math.max(200, Math.min(450, e.clientX)));
    }
    if (isResizingRight) {
      setRightPanelWidth(Math.max(250, Math.min(600, window.innerWidth - e.clientX)));
    }
  }, [isResizingLeft, isResizingRight]);

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight, handleMouseMove, handleMouseUp]);

  const addComponent = (item: ResourceItem, category: ResourceCategory) => {
      const x = 300 + (Math.random() * 50);
      const y = 200 + (Math.random() * 50);
      const newComponent: PBLComponentData = {
        id: Date.now().toString(),
        x,
        y,
        category: category.id,
        nodeType: item.nodeType,
        interactionType: item.interactionType,
        title: item.title,
        type: item.type,
        fields: item.defaultFields.map(f => ({...f})),
        result: '',
        results: [],
        activeResultIndex: -1,
        pinnedResultIndex: 0,
        isExpanded: true,
        stages: item.stages ? JSON.parse(JSON.stringify(item.stages)) : undefined,
        hasInputs: item.hasInputs ?? true,
        hasOutputs: item.hasOutputs ?? true
      };
      setComponents(prev => [...prev, newComponent]);
      setActiveCategory(category.id);
  };

  const addProject = () => {
    const newP = {
      id: Date.now().toString(),
      title: '新 PBL 项目 ' + (projects.length + 1),
      subject: '未定义学科',
      icon: '✨',
      status: '草稿'
    };
    setProjects(prev => [newP, ...prev]);
  };

  const handleUpdateComponent = (id: string, updates: Partial<PBLComponentData>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
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
                     <h1 className="text-3xl font-display font-black text-doodle-black">PBL 课程库</h1>
                  </div>
                  <button onClick={addProject} className="flex items-center gap-2 px-6 py-3 bg-doodle-yellow border-3 border-doodle-black rounded-2xl font-black shadow-pop hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-none">
                    <Plus size={20}/> 新增项目
                  </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {projects.map(p => (
                    <div key={p.id} onClick={() => setViewState('workspace')} className="group bg-white rounded-3xl border-3 border-doodle-black shadow-pop hover:-translate-y-2 transition-all cursor-pointer overflow-hidden flex flex-col h-80 relative">
                        <div className="h-2/5 bg-doodle-yellow border-b-3 border-doodle-black flex items-center justify-center">
                            <span className="text-4xl">{p.icon}</span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-black text-xl text-doodle-black mb-2">{p.title}</h3>
                            <p className="text-sm text-gray-500 font-bold mb-4">{p.subject}</p>
                            <div className="mt-auto flex justify-between items-center">
                                <span className={`px-3 py-1 rounded-lg text-xs font-black border-2 ${p.status === '编辑中' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{p.status}</span>
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden font-sans text-slate-800 bg-white">
      <header className="h-16 bg-white border-b-3 border-doodle-black flex items-center justify-between px-4 z-50 shrink-0">
          <div className="flex items-center gap-3">
              <button onClick={() => setViewState('catalog')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft size={20} className="text-doodle-black"/>
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsLeftVisible(!isLeftVisible)}
                  className={`p-2 rounded-lg transition-colors border-2 ${isLeftVisible ? 'bg-doodle-yellow border-doodle-black' : 'hover:bg-gray-100 border-transparent'}`}
                >
                  <Sidebar size={18} />
                </button>
                <h1 className="font-black text-base text-doodle-black ml-2">流浪猫避雨屋</h1>
              </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex bg-gray-100 p-1 rounded-xl border-2 border-doodle-black">
              <NavTab active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<PenTool size={16}/>} label="设计" />
              <NavTab active={activeTab === 'distribute'} onClick={() => setActiveTab('distribute')} icon={<Send size={16}/>} label="分发" />
              <NavTab active={activeTab === 'teach'} onClick={() => setActiveTab('teach')} icon={<MonitorPlay size={16}/>} label="授课" />
              <NavTab active={activeTab === 'reflect'} onClick={() => setActiveTab('reflect')} icon={<Layout size={16}/>} label="复盘" />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-lg transition-colors border-2 ${isChatOpen ? 'bg-doodle-blue border-doodle-black text-white' : 'hover:bg-gray-100 border-transparent'}`}
            >
              <MessageSquareText size={18} />
            </button>
          </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
          {activeTab === 'teach' ? (
              <TeachingDashboard components={components} setComponents={setComponents} onSwitchToDesign={() => setActiveTab('design')} />
          ) : activeTab === 'reflect' ? (
              <ReflectionView components={components} onPromoteAsset={(asset) => {}} onUpdateDesign={(diag) => {}} />
          ) : (
            <>
                <div 
                  className={`transition-all duration-300 ease-in-out ${isLeftVisible ? 'flex' : 'hidden'} h-full z-10 overflow-hidden bg-white border-r-3 border-doodle-black shrink-0 relative`}
                  style={{ width: leftPanelWidth }}
                >
                    <div className="flex-1 min-w-0">
                      <LeftPanel onAddComponent={addComponent} />
                    </div>
                    {/* 左侧拉手 */}
                    <div 
                      className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-doodle-yellow active:bg-doodle-orange transition-colors z-20 flex items-center justify-center group"
                      onMouseDown={() => setIsResizingLeft(true)}
                    >
                      <div className="w-3 h-8 bg-white border-2 border-doodle-black rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <GripVertical size={10} />
                      </div>
                    </div>
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
                        onSelectComponentForDetail={(id) => setSelectedCompForDetail(id)}
                    />
                </div>

                {/* 右侧详情编辑栏 */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${selectedCompForDetail ? 'flex' : 'hidden'} h-full z-10 overflow-hidden bg-white border-l-3 border-doodle-black shrink-0 relative`}
                  style={{ width: rightPanelWidth }}
                >
                    {/* 右侧拉手 */}
                    <div 
                      className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-doodle-yellow active:bg-doodle-orange transition-colors z-20 flex items-center justify-center group"
                      onMouseDown={() => setIsResizingRight(true)}
                    >
                      <div className="w-3 h-8 bg-white border-2 border-doodle-black rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <GripVertical size={10} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {selectedCompForDetail && (
                        <DetailSidebar 
                          component={components.find(c => c.id === selectedCompForDetail)!} 
                          onUpdate={(updates) => handleUpdateComponent(selectedCompForDetail, updates)}
                          onClose={() => setSelectedCompForDetail(null)}
                        />
                      )}
                    </div>
                </div>

                {/* Notion AI 悬浮弹窗风格 ChatBot */}
                {isChatOpen && (
                  <div className="fixed bottom-10 right-10 w-[400px] h-[600px] z-[100] animate-in slide-in-from-bottom-5">
                    <RightPanel 
                      onClose={() => setIsChatOpen(false)}
                      onAddComponentFromAI={(data) => {
                        const newComp: PBLComponentData = {
                          id: Date.now().toString(),
                          x: 400, y: 300,
                          category: data.category || 'scaffold-group',
                          nodeType: 'processor',
                          interactionType: data.interactionType || 'generative',
                          title: data.title || 'AI 建议节点',
                          type: data.type || 'generic',
                          fields: data.fields || [],
                          result: data.result || '',
                          results: data.result ? [data.result] : [],
                          activeResultIndex: 0,
                          pinnedResultIndex: 0,
                          isExpanded: true,
                          hasInputs: true,
                          hasOutputs: true
                        };
                        setComponents(prev => [...prev, newComp]);
                      }} 
                    />
                  </div>
                )}
            </>
          )}
      </div>
    </div>
  );
}

const NavTab = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-black transition-all ${active ? 'bg-doodle-black text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}>
        {icon} <span className="hidden lg:inline whitespace-nowrap">{label}</span>
    </button>
)

export default App;

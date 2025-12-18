
import React, { useState, useRef, useEffect } from 'react';
import { Users, AlertTriangle, Zap, MessageSquare, Send, X, PlusCircle, CheckCircle, Monitor, BookOpen, PenTool, Layout, Heart, Camera, ChevronRight, Sliders, Paperclip, Edit3, Bot, Sparkles, BrainCircuit, ArrowUpRight, GripHorizontal, Eye, AlignLeft, Lightbulb, Gavel } from 'lucide-react';
import { StudentGroup, PBLComponentData, GroupMessage, IssueCategory, AIChatItem, AIControllers } from '../types';
import { generateScopedIntervention } from '../services/geminiService';

interface TeachingDashboardProps {
  components: PBLComponentData[];
  setComponents: React.Dispatch<React.SetStateAction<PBLComponentData[]>>;
  onSwitchToDesign: () => void;
}

const MOCK_MESSAGES: GroupMessage[] = [
    { id: 'm1', sender: 'Alice', text: '我觉得我们可以用硬纸板做底座。', timestamp: '10:02' },
    { id: 'm2', sender: 'Bob', text: '但是硬纸板不防水啊，上次测试就湿了。', timestamp: '10:03' },
    { id: 'm3', sender: 'Charlie', text: '那我们用塑料瓶剪开包在外面？', timestamp: '10:04' },
    { id: 'm4', sender: 'Alice', text: '好像可以，但是怎么固定呢？', timestamp: '10:05' },
];

const MOCK_GROUPS: StudentGroup[] = [
    { id: 'g1', name: '探索者小队', avatarColor: 'bg-doodle-blue', members: ['Alice', 'Bob', 'Charlie'], status: 'active', currentStageId: 'pro', messages: MOCK_MESSAGES },
    { id: 'g2', name: '火箭工程队', avatarColor: 'bg-doodle-orange', members: ['Dave', 'Eve', 'Frank'], status: 'stuck', currentStageId: 'ide', issue: '构思停滞', issueType: 'cognitive', messages: [] },
    { id: 'g3', name: '未来创造者', avatarColor: 'bg-doodle-green', members: ['Grace', 'Heidi'], status: 'active', currentStageId: 'pro', messages: [] },
    { id: 'g4', name: '创新实验室', avatarColor: 'bg-doodle-purple', members: ['Ivan', 'Judy', 'Kevin'], status: 'idle', currentStageId: 'ide', issue: '分工冲突', issueType: 'collaboration', messages: [] },
    { id: 'g5', name: '深海探险', avatarColor: 'bg-doodle-yellow', members: ['Leo', 'Mike'], status: 'active', currentStageId: 'tes', messages: [] },
    { id: 'g6', name: '星际穿越', avatarColor: 'bg-red-400', members: ['Nancy', 'Oscar'], status: 'active', currentStageId: 'emp', messages: [] },
];

export const TeachingDashboard: React.FC<TeachingDashboardProps> = ({ components }) => {
    const [groups, setGroups] = useState<StudentGroup[]>(MOCK_GROUPS);
    const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);
    
    // 获取任务链阶段
    const taskComponent = components.find(c => c.type === 'task-edp');
    const stages = taskComponent?.stages || [
        { id: 'emp', name: '共情', attachments: [] },
        { id: 'def', name: '定义', attachments: [] },
        { id: 'ide', name: '构思', attachments: [] },
        { id: 'pro', name: '原型', attachments: [] },
        { id: 'tes', name: '测试', attachments: [] }
    ];

    const [issueCategory, setIssueCategory] = useState<IssueCategory>('design');
    const [controllers, setControllers] = useState<AIControllers>({
        supportLevel: 50,
        strategy: 50,
        modality: 20
    });

    const [superInputContent, setSuperInputContent] = useState('');
    const [superInputMode, setSuperInputMode] = useState<SuperInputMode>('ai');
    const [aiChatHistory, setAiChatHistory] = useState<AIChatItem[]>([]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedGroup) {
            setAiChatHistory([{
                id: 'intro', role: 'ai',
                content: `老师您好！"${selectedGroup.name}"目前处于"${stages.find(s=>s.id===selectedGroup.currentStageId)?.name}"环节。检测到潜在挑战：${selectedGroup.issue || '暂无明显异常'}。`
            }]);
        }
    }, [selectedGroup]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [aiChatHistory]);

    const handleSuperSubmit = async () => {
        if (!superInputContent.trim()) return;
        if (superInputMode === 'student') {
            const newMsg: GroupMessage = { id: Date.now().toString(), sender: '教师', text: superInputContent, timestamp: '刚刚', isTeacher: true };
            setGroups(prev => prev.map(g => g.id === selectedGroup!.id ? { ...g, messages: [...g.messages, newMsg], status: 'active', issue: undefined } : g));
            setSuperInputContent('');
            setAiChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'teacher', content: '（已发送指导建议给学生）' }]);
        } else {
            const userMsg: AIChatItem = { id: Date.now().toString(), role: 'teacher', content: superInputContent };
            setAiChatHistory(prev => [...prev, userMsg]);
            setSuperInputContent('');
            setIsAiThinking(true);
            const result = await generateScopedIntervention(components, selectedGroup!.currentStageId, issueCategory, controllers, userMsg.content, aiChatHistory);
            setAiChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: result.explanation, studentDraft: result.studentDraft, contextSource: result.sourceName, contextContent: result.sourceContent }]);
            setIsAiThinking(false);
        }
    };

    return (
        <div className="h-full bg-doodle-bg flex flex-col p-6 overflow-hidden w-full">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                     <h1 className="text-2xl font-display font-black text-doodle-black">PBL 数字化泳道图</h1>
                     <p className="text-sm text-gray-500 font-bold">全班 6 个小组进度实时监控</p>
                </div>
                <div className="flex gap-4">
                     <div className="bg-white px-4 py-2 rounded-xl border-2 border-doodle-black shadow-pop-sm flex items-center gap-2">
                         <div className="w-3 h-3 bg-doodle-green rounded-full"></div>
                         <span className="text-xs font-bold uppercase">4 Active</span>
                     </div>
                     <div className="bg-white px-4 py-2 rounded-xl border-2 border-doodle-black shadow-pop-sm flex items-center gap-2">
                         <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                         <span className="text-xs font-bold text-red-500 uppercase">2 Stuck</span>
                     </div>
                </div>
            </div>

            {/* 泳道图主体 */}
            <div className="flex-1 bg-white rounded-3xl border-3 border-doodle-black shadow-pop overflow-hidden flex flex-col min-h-0">
                <div className="flex border-b-3 border-doodle-black bg-gray-100 shrink-0">
                    <div className="w-48 p-4 font-black text-doodle-black border-r-3 border-doodle-black">小组列表</div>
                    {stages.map((stage) => (
                        <div key={stage.id} className="flex-1 p-4 border-r-2 border-gray-200 last:border-0 text-center flex flex-col items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-white border-2 border-doodle-black flex items-center justify-center text-xs font-black shadow-pop-sm mb-1">
                                {stage.name[0]}
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase">{stage.name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {groups.map(group => (
                        <div key={group.id} className="flex border-b-2 border-gray-100 hover:bg-yellow-50/50 transition-colors h-24 group">
                            <div className="w-48 p-4 border-r-3 border-doodle-black shrink-0 flex items-center justify-between cursor-pointer" onClick={() => setSelectedGroup(group)}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl ${group.avatarColor} border-2 border-doodle-black text-white flex items-center justify-center font-black shadow-pop-sm`}>
                                        {group.name[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm text-doodle-black truncate w-24">{group.name}</span>
                                        <span className="text-[10px] font-bold text-gray-400">成员: {group.members.length}</span>
                                    </div>
                                </div>
                                {group.status === 'stuck' && <AlertTriangle size={16} className="text-red-500 shrink-0 animate-bounce" />}
                            </div>

                            {stages.map(stage => {
                                const isCurrent = group.currentStageId === stage.id;
                                return (
                                    <div key={stage.id} className="flex-1 border-r border-gray-50 last:border-0 flex items-center justify-center relative p-1" onClick={() => setSelectedGroup(group)}>
                                        {isCurrent && (
                                            <div className={`w-full h-full max-h-[80px] rounded-2xl border-2 border-doodle-black shadow-pop-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 ${group.status === 'stuck' ? 'bg-red-50' : 'bg-white'}`}>
                                                <div className={`w-2 h-2 rounded-full ${group.status === 'stuck' ? 'bg-red-500 animate-pulse' : 'bg-doodle-green'}`} />
                                                <span className="text-[10px] font-black">{group.status === 'stuck' ? '需干预' : '活跃中'}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* 协作弹窗 */}
            {selectedGroup && (
                <div className="fixed inset-0 bg-doodle-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[2rem] shadow-pop border-3 border-doodle-black flex flex-col overflow-hidden">
                        <div className="h-16 px-6 border-b-3 border-doodle-black flex justify-between items-center bg-doodle-yellow shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${selectedGroup.avatarColor} border-2 border-doodle-black text-white flex items-center justify-center font-black shadow-sm`}>{selectedGroup.name[0]}</div>
                                <h2 className="text-lg font-black">{selectedGroup.name}</h2>
                            </div>
                            <button onClick={() => setSelectedGroup(null)} className="p-2 hover:bg-red-100 rounded-lg"><X size={20}/></button>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-[35%] flex flex-col border-r-2 border-gray-100 bg-gray-50/50">
                                <div className="p-3 border-b border-gray-100 font-black text-[10px] text-gray-400 uppercase">讨论记录</div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {selectedGroup.messages.map(msg => (
                                        <div key={msg.id} className={`flex flex-col ${msg.isTeacher ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[9px] font-bold text-gray-400 mb-1">{msg.sender}</span>
                                            <div className={`p-2 rounded-xl text-xs font-bold border-2 border-doodle-black shadow-sm max-w-[90%] ${msg.isTeacher ? 'bg-doodle-blue text-white' : 'bg-white text-doodle-black'}`}>{msg.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-[65%] flex flex-col bg-white">
                                <div className="p-4 border-b-2 border-gray-100 space-y-3">
                                    <div className="text-[10px] font-black text-doodle-purple uppercase flex items-center gap-1"><Sliders size={12}/> 策略调节器</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-bold"><span className="flex items-center gap-1"><Lightbulb size={10}/>启发</span><span className="flex items-center gap-1"><Gavel size={10}/>指令</span></div>
                                            <input type="range" className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-doodle-purple" value={controllers.strategy} onChange={(e)=>setControllers({...controllers, strategy: parseInt(e.target.value)})}/>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-bold"><span>低支架</span><span>高支架</span></div>
                                            <input type="range" className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-doodle-orange" value={controllers.supportLevel} onChange={(e)=>setControllers({...controllers, supportLevel: parseInt(e.target.value)})}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/30">
                                    {aiChatHistory.map(msg => (
                                        <div key={msg.id} className={`flex flex-col ${msg.role === 'teacher' ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-3 rounded-2xl text-xs font-medium border-2 border-doodle-black shadow-sm max-w-[85%] ${msg.role === 'teacher' ? 'bg-doodle-black text-white' : 'bg-white'}`}>
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                                {msg.studentDraft && (
                                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                                                        <div className="text-[9px] text-gray-400 font-black mb-1">建议回复:</div>
                                                        <div className="text-gray-500 italic p-2 bg-gray-50 rounded-lg">{msg.studentDraft}</div>
                                                        <button onClick={() => {setSuperInputMode('student'); setSuperInputContent(msg.studentDraft!)}} className="mt-2 text-[10px] font-black text-doodle-blue flex items-center gap-1 hover:underline"><Edit3 size={10}/> 应用草稿</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiThinking && <div className="animate-pulse flex items-center gap-2 p-3 bg-white border-2 border-doodle-black rounded-xl w-fit"><Sparkles size={14} className="text-doodle-purple"/><span className="text-[10px] font-black">思考中...</span></div>}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 border-t-2 border-gray-100 bg-white">
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={()=>setSuperInputMode('ai')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 border-2 border-doodle-black ${superInputMode === 'ai' ? 'bg-doodle-purple text-white shadow-pop-sm' : 'bg-white'}`}><BrainCircuit size={12}/>咨询 AI</button>
                                        <button onClick={()=>setSuperInputMode('student')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 border-2 border-doodle-black ${superInputMode === 'student' ? 'bg-doodle-blue text-white shadow-pop-sm' : 'bg-white'}`}><Send size={12}/>指导学生</button>
                                    </div>
                                    <div className={`relative p-1 rounded-xl border-2 border-doodle-black ${superInputMode === 'ai' ? 'bg-doodle-purple' : 'bg-doodle-blue'}`}>
                                        <textarea value={superInputContent} onChange={(e)=>setSuperInputContent(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),handleSuperSubmit())} className="w-full h-16 p-2 rounded-lg text-xs font-bold focus:outline-none bg-white resize-none" placeholder={superInputMode === 'ai' ? '咨询 AI 教学策略...' : '发送实时反馈给该小组...'} />
                                        <button onClick={handleSuperSubmit} className="absolute bottom-2 right-2 p-1.5 bg-doodle-black text-white rounded-lg hover:scale-105 active:scale-95 transition-all"><ArrowUpRight size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

type SuperInputMode = 'ai' | 'student';

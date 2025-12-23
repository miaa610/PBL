
import React, { useState } from 'react';
import { ChevronDown, BookOpen, Settings, Target, Zap, Goal, PenTool, Coffee, Lightbulb, Users, Palette, Layout, Box, Radar, Layers } from 'lucide-react';
import { ResourceCategory, ResourceItem } from '../types';

interface LeftPanelProps {
  onAddComponent: (item: ResourceItem, category: ResourceCategory) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onAddComponent }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('dq-group');

  const categories: ResourceCategory[] = [
    {
      id: 'dq-group',
      title: '驱动问题',
      colorClass: 'bg-doodle-yellow',
      items: [
        { id: 'dq-1', title: '课标卡', nodeType: 'source', type: 'dq-curriculum', interactionType: 'generative', icon: <BookOpen size={16}/>, defaultFields: [
          { id: 'f1', label: '学生年级', value: '请选择年级', type: 'select', options: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三'] }, 
          { id: 'f2', label: '学科', value: '请选择学科', type: 'select', options: ['科学', '数学', '语文', '英语', '艺术', '工程', '综合实践'] },
          { id: 'f3', label: '核心知识点', value: '请输入或由 AI 建议本项目的关键课标要求...', type: 'textarea' }
        ], hasInputs: false, hasOutputs: true },
        { id: 'dq-2', title: '资源配置', nodeType: 'source', type: 'dq-resource', interactionType: 'parameter', icon: <Settings size={16}/>, defaultFields: [
          { id: 'f1', label: '课时预算', value: '8课时', type: 'select', options: ['2课时', '4课时', '8课时', '12课时', '16课时'] },
          { id: 'f2', label: '材料库', value: '请输入项目所需的工具、耗材列表...', type: 'textarea' },
          { id: 'f3', label: '场地', value: '普通教室', type: 'select', options: ['普通教室', '创客空间', '科学实验室', '户外草坪', '礼堂'] }
        ], hasInputs: false, hasOutputs: true },
        { id: 'dq-3', title: '驱动性问题生成', nodeType: 'processor', type: 'dq-problem', interactionType: 'generative', icon: <Target size={16}/>, defaultFields: [
          { id: 'f1', label: '角色', value: '输入项目的主体角色，如：建筑师、志愿者...', type: 'text' },
          { id: 'f2', label: '行动', value: '描述要解决的任务，如：设计、改善、研究...', type: 'text' },
          { id: 'f3', label: '对象', value: '任务指向的具体事物，如：社区环境、校园浪费...', type: 'text' },
          { id: 'f4', label: '目的/影响', value: '希望达到的长远目标，如：提升生活质量...', type: 'text' },
          { id: 'f5', label: '驱动型问题 (HMW)', value: '点击 AI 生成一个富有挑战性的驱动问题...', type: 'textarea' }
        ], hasInputs: true, hasOutputs: true },
        { id: 'dq-4', title: '情景导入', nodeType: 'application', type: 'dq-context', interactionType: 'generative', icon: <Zap size={16}/>, defaultFields: [
          { id: 'f1', label: '任务风格', value: '任务风格', type: 'select', options: ['任务风格', '新闻风格', '角色扮演', '科幻风格'] },
          { id: 'f2', label: '情景文案', value: '根据选择的风格，生成吸引学生的开场故事...', type: 'textarea' }
        ], hasInputs: true, hasOutputs: false }
      ]
    },
    {
      id: 'task-group',
      title: '项目任务',
      colorClass: 'bg-doodle-orange',
      items: [
        { id: 'tk-1', title: '设计流程', nodeType: 'processor', type: 'task-edp', interactionType: 'generative', icon: <PenTool size={16}/>, defaultFields: [
          { id: 'f1', label: '定义', value: '描述学生如何理解并界定问题...', type: 'textarea' },
          { id: 'f2', label: '共情', value: '记录学生如何了解用户需求...', type: 'textarea' },
          { id: 'f3', label: '构思', value: '描述学生发散思维、产生创意的过程...', type: 'textarea' },
          { id: 'f4', label: '原型', value: '说明学生如何动手制作初步模型...', type: 'textarea' },
          { id: 'f5', label: '测试', value: '记录学生对原型进行迭代评估的方式...', type: 'textarea' }
        ], hasInputs: true, hasOutputs: true },
        { id: 'tk-2', title: '支持性活动', nodeType: 'processor', type: 'task-support', interactionType: 'generative', icon: <Coffee size={16}/>, defaultFields: [
          { id: 'f1', label: '支架强度', value: '50', type: 'slider' },
          { id: 'f2', label: '活动描述', value: '输入用于支架学生学习的小活动，如：拆解微课、互评会...', type: 'textarea' }
        ], hasInputs: true, hasOutputs: true }
      ]
    },
    {
      id: 'scaffold-group',
      title: '支持性工具',
      colorClass: 'bg-doodle-blue',
      subCategories: [
        { title: '发散支架', items: [
          { id: 'sc-1', title: 'SCAMPER', nodeType: 'application', type: 'scaffold-scamper', interactionType: 'parameter', icon: <Lightbulb size={14}/>, defaultFields: [
            { id: 's1', label: 'S', value: '替代：能否用其他材料替换？', type: 'textarea' },
            { id: 's2', label: 'C', value: '合并：能否与其他功能结合？', type: 'textarea' },
            { id: 's3', label: 'A', value: '调整：能否改变形状或结构？', type: 'textarea' },
            { id: 's4', label: 'M', value: '修改：能否放大或缩小某部分？', type: 'textarea' },
            { id: 's5', label: 'P', value: '另用：能否用于其他目的？', type: 'textarea' },
            { id: 's6', label: 'E', value: '消除：能否精简不必要的部分？', type: 'textarea' },
            { id: 's7', label: 'R', value: '重组：能否倒置或重新排序？', type: 'textarea' }
          ] }
        ] },
        { title: '收敛支架', items: [
          { id: 'sc-2', title: '用户画像', nodeType: 'application', type: 'scaffold-persona', interactionType: 'parameter', icon: <Users size={14}/>, defaultFields: [
            { id: 'p1', label: '姓名', value: '请输入虚构用户姓名', type: 'text' },
            { id: 'p2', label: '年龄', value: '请输入用户年龄', type: 'text' },
            { id: 'p3', label: '基本信息', value: '描述用户的职业、生活背景...', type: 'textarea' },
            { id: 'p4', label: '行为特征', value: '用户平时的行为偏好...', type: 'textarea' },
            { id: 'p5', label: '目标动机', value: '用户想要达成的具体目的...', type: 'textarea' },
            { id: 'p6', label: '痛点需求', value: '用户目前面临的最核心困难...', type: 'textarea' },
            { id: 'p7', label: '用户路径', value: '描述用户完成任务的步骤...', type: 'textarea' }
          ] },
          { id: 'sc-3', title: '同理心地图', nodeType: 'application', type: 'scaffold-empathy', interactionType: 'parameter', icon: <Palette size={14}/>, defaultFields: [
            { id: 'e1', label: '想法&感受', value: '用户内心深处的顾虑或期待...', type: 'textarea' },
            { id: 'e2', label: '所听', value: '用户从他人那里听到的信息...', type: 'textarea' },
            { id: 'e3', label: '所见', value: '用户在环境中观察到的事实...', type: 'textarea' },
            { id: 'e4', label: '说&做', value: '用户的公开言论和实际行动...', type: 'textarea' },
            { id: 'e5', label: '痛点', value: '令用户感到沮丧或不便的地方...', type: 'textarea' },
            { id: 'e6', label: '收获', value: '用户通过解决方案能获得的益处...', type: 'textarea' }
          ] }
        ] },
        { title: '原型支架', items: [
          { id: 'sc-4', title: '故事板', nodeType: 'application', type: 'scaffold-story', interactionType: 'parameter', icon: <Layout size={14}/>, defaultFields: [
            { id: 'st1', label: '场景1', value: '描述第一个镜头发生的故事情节...', type: 'story-shot' }
          ] },
          { id: 'sc-5', title: '材料卡', nodeType: 'application', type: 'scaffold-material', interactionType: 'parameter', icon: <Box size={14}/>, defaultFields: [
            { id: 'm1', label: '材料名称', value: '输入材料或工具名称', type: 'text' },
            { id: 'm2', label: '规格/用途', value: '详细说明该材料的使用方法和参数...', type: 'textarea' }
          ] }
        ] }
      ]
    },
    {
      id: 'assess-group',
      title: '评价',
      colorClass: 'bg-doodle-green',
      items: [
        { id: 'as-1', title: '评价量表', nodeType: 'application', type: 'assess-rubric', interactionType: 'generative', icon: <Radar size={16}/>, defaultFields: [
          { id: 'd1', label: '维度', value: '评价维度1', type: 'radar-dim', weight: 40 },
          { id: 'd2', label: '维度', value: '评价维度2', type: 'radar-dim', weight: 30 },
          { id: 'r1', label: '量表全文 (AI 基于维度生成)', value: '点击按钮，AI 将根据上述维度自动生成评价细则...', type: 'textarea' }
        ], hasInputs: true, hasOutputs: false }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="h-16 flex items-center px-4 border-b-3 border-doodle-black shrink-0 bg-doodle-bg">
        <Layers size={18} className="mr-2" />
        <h1 className="font-display font-black text-sm uppercase">PBL 课程构件库</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl border-3 border-doodle-black overflow-hidden shadow-pop-sm">
            <button 
              onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              className={`w-full flex items-center justify-between p-3 font-black text-[11px] uppercase tracking-tight ${cat.colorClass} border-b-3 border-doodle-black`}
            >
              <span>{cat.title}</span>
              <ChevronDown size={14} className={`transition-transform ${expandedCategory === cat.id ? 'rotate-180' : ''}`}/>
            </button>
            {expandedCategory === cat.id && (
              <div className="bg-white p-1 space-y-1">
                {cat.items?.map(item => (
                  <div key={item.id} onClick={() => onAddComponent(item, cat)} className="flex items-center gap-3 p-2 hover:bg-yellow-50 rounded-lg cursor-pointer border-2 border-transparent hover:border-doodle-black group transition-all">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-doodle-black transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-black">{item.title}</span>
                  </div>
                ))}
                {cat.subCategories?.map(sub => (
                  <div key={sub.title} className="mt-2 border-t-2 border-dashed border-gray-100 pt-2 pb-1">
                    <div className="px-2 text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">{sub.title}</div>
                    {sub.items.map(item => (
                      <div key={item.id} onClick={() => onAddComponent(item, cat)} className="flex items-center gap-2 p-1.5 hover:bg-yellow-50 rounded-lg cursor-pointer border-2 border-transparent hover:border-doodle-black group transition-all">
                        <span className="text-gray-300 group-hover:text-doodle-black ml-1">{item.icon}</span>
                        <span className="text-[10px] font-black">{item.title}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

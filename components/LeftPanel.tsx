
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Anchor, Target, Layout, ClipboardCheck, Zap, Layers, Plus, Compass, Grid, Settings, ToggleLeft, FastForward, Wrench, BookOpen, Package, Users, Palette, PenTool, BarChart3, Presentation } from 'lucide-react';
import { ResourceCategory, ResourceItem, ComponentCategory } from '../types';

interface LeftPanelProps {
  onAddComponent: (item: ResourceItem, category: ResourceCategory) => void;
  activeCategory?: ComponentCategory;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onAddComponent }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('dq-2.0');

  const categories: ResourceCategory[] = [
    {
      id: 'dq-2.0',
      title: '驱动型问题 2.0',
      colorClass: 'bg-doodle-yellow',
      items: [
        { 
          id: 'c-1', title: '课标卡', type: 'dq-curriculum', interactionType: 'parameter', icon: <BookOpen size={18}/>,
          defaultFields: [
            { id: 'f1', label: '学生年级', value: '五年级', type: 'select', options: ['三年级','四年级','五年级','六年级','初中','高中'] },
            { id: 'f2', label: '核心学科', value: '科学', type: 'select', options: ['科学','数学','语文','艺术','工程'] },
            { id: 'f3', label: '相关知识点', value: '摩擦力、简单机械', type: 'tags' }
          ]
        },
        { 
          id: 'c-2', title: '资源配置', type: 'dq-resource', interactionType: 'parameter', icon: <Package size={18}/>,
          defaultFields: [
            { id: 'f1', label: '课时预算', value: '8', type: 'slider', range: [1, 24] },
            { id: 'f2', label: '材料库', value: '基础耗材', type: 'select', options: ['基础耗材','电子套件','回收材料','木工工具'] },
            { id: 'f3', label: '场地', value: '普通教室', type: 'select', options: ['普通教室','创客空间','户外','实验室'] }
          ]
        },
        { 
          id: 'c-3', title: '基于学情', type: 'dq-learner', interactionType: 'generative', icon: <Users size={18}/>,
          defaultFields: [
            { id: 'f1', label: '学习目标', value: '', type: 'textarea', placeholder: '学生需要掌握什么？' },
            { id: 'f2', label: '目标重要性', value: '50', type: 'slider', range: [0, 100] },
            { id: 'f3', label: '分析技能与内容', value: '', type: 'textarea' },
            { id: 'f4', label: '综合现实产品/角色', value: '', type: 'text' }
          ]
        },
        { 
          id: 'c-4', title: '基于问题', type: 'dq-problem', interactionType: 'generative', icon: <Target size={18}/>,
          defaultFields: [
            { id: 'f1', label: '主体/角色', value: '工程师', type: 'text' },
            { id: 'f2', label: '行动/挑战', value: '设计并制作', type: 'text' },
            { id: 'f3', label: '对象', value: '流浪猫', type: 'text' },
            { id: 'f4', label: '目的/影响', value: '提供安全的避雨环境', type: 'text' }
          ]
        },
        { 
          id: 'c-5', title: '情境导入卡', type: 'dq-context', interactionType: 'generative', icon: <Presentation size={18}/>,
          defaultFields: [
            { id: 'f1', label: '情境风格', value: '任务风格', type: 'select', options: ['任务风格','新闻风格','角色扮演','科幻风格'] }
          ]
        }
      ]
    },
    {
      id: 'task-component',
      title: '任务组件',
      colorClass: 'bg-doodle-purple',
      items: [
        { 
          id: 'c-7', title: '工程设计流程', type: 'task-edp', interactionType: 'node', icon: <Wrench size={18}/>,
          defaultFields: [],
          stages: [
            { id: 'emp', name: '共情', attachments: [] },
            { id: 'def', name: '定义', attachments: [] },
            { id: 'ide', name: '构思', attachments: [] },
            { id: 'pro', name: '原型', attachments: [] },
            { id: 'tes', name: '测试', attachments: [] }
          ]
        }
      ]
    },
    {
      id: 'scaffold-group',
      title: '支架组 (分层支架)',
      colorClass: 'bg-doodle-orange',
      items: [
        { 
          id: 'c-8', title: '收敛思维:用户画像', type: 'scaffold-persona', interactionType: 'parameter', icon: <Users size={18}/>,
          defaultFields: [
            { id: 'f1', label: '画像深度', value: '中等', type: 'select', options: ['精简','中等','深度'] }
          ]
        },
        { 
          id: 'c-11', title: '收敛思维:同理心地图', type: 'scaffold-empathy', interactionType: 'generative', icon: <Palette size={18}/>,
          defaultFields: [
            { id: 'f1', label: '观察维度', value: '多维', type: 'select', options: ['行为','言语','情感','多维'] }
          ]
        },
        { 
          id: 'c-story', title: '制作与原型:故事板', type: 'scaffold-storyboard', interactionType: 'parameter', icon: <PenTool size={18}/>,
          defaultFields: [
            { id: 'f1', label: '画格数量', value: '4', type: 'slider', range: [3, 8] }
          ]
        }
      ]
    },
    {
      id: 'assessment-class',
      title: '评价类',
      colorClass: 'bg-doodle-green',
      items: [
        { 
          id: 'c-13', title: '多维设计评价矩阵', type: 'assess-matrix', interactionType: 'generative', icon: <BarChart3 size={18}/>,
          defaultFields: [
            { id: 'f1', label: '评价维度', value: '功能性、审美、工程思维', type: 'text' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col bg-doodle-bg border-r-3 border-doodle-black z-20 overflow-hidden">
      <div className="h-20 flex items-center px-4 border-b-3 border-doodle-black bg-white shrink-0">
        <div className="w-10 h-10 bg-doodle-yellow border-3 border-doodle-black rounded-lg flex items-center justify-center shadow-pop-sm mr-3">
          <Layers size={20} strokeWidth={3} />
        </div>
        <h1 className="font-display font-black text-doodle-black text-lg">PBL 组件体系</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 flex flex-col items-center py-6 gap-6 border-r-3 border-doodle-black bg-white shrink-0">
          <Compass className="text-doodle-black" size={24} />
          <Grid className="text-gray-300" size={24} />
          <Settings className="text-gray-300" size={24} />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border-2 border-doodle-black overflow-hidden shadow-pop-sm">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 border-b-2 border-doodle-black"
              >
                <span className="font-black text-xs text-doodle-black">{cat.title}</span>
                {expandedCategory === cat.id ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
              </button>
              {expandedCategory === cat.id && (
                <div className="p-2 space-y-2">
                  {cat.items.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => onAddComponent(item, cat)}
                      className="group flex items-center justify-between p-2 bg-white border-2 border-gray-100 rounded-lg hover:border-doodle-black hover:bg-yellow-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 group-hover:text-doodle-black">{item.icon}</span>
                        <span className="font-bold text-[11px] leading-tight">{item.title}</span>
                      </div>
                      <Plus size={14} className="text-gray-300 group-hover:text-doodle-black"/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

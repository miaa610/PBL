
import React, { useRef, useState, useMemo } from 'react';
import { PBLComponentData, ComponentCategory, AppMode, Connection } from '../types';
import { CanvasCard } from './CanvasCard';
import { Circle, CheckCircle2 } from 'lucide-react';

interface MiddleCanvasProps {
  components: PBLComponentData[];
  setComponents: React.Dispatch<React.SetStateAction<PBLComponentData[]>>;
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  onNavigate: (category: ComponentCategory) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

// Updated FLOW_STEPS to use valid ComponentCategory values from types.ts
const FLOW_STEPS: { id: ComponentCategory; label: string }[] = [
  { id: 'dq-2.0', label: '驱动问题' },
  { id: 'task-component', label: '核心任务' },
  { id: 'scaffold-group', label: '支持活动' },
  { id: 'custom-node', label: '支持工具' },
  { id: 'assessment-class', label: '评价反思' },
];

export const MiddleCanvas: React.FC<MiddleCanvasProps> = ({ 
  components, setComponents, connections, setConnections, onNavigate 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<{ id: string, startX: number, startY: number, initialLeft: number, initialTop: number } | null>(null);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const component = components.find(c => c.id === id);
    if (component) setDraggedItem({ id, startX: e.clientX, startY: e.clientY, initialLeft: component.x, initialTop: component.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem) {
      const dx = e.clientX - draggedItem.startX;
      const dy = e.clientY - draggedItem.startY;
      setComponents(prev => prev.map(c => c.id === draggedItem.id ? { ...c, x: draggedItem.initialLeft + dx, y: draggedItem.initialTop + dy } : c));
    }
  };

  const handleMouseUp = () => setDraggedItem(null);

  const onStartLink = (id: string) => setLinkingFrom(id);
  const onEndLink = (id: string) => {
    if (linkingFrom && linkingFrom !== id) {
      const exists = connections.some(c => (c.from === linkingFrom && c.to === id) || (c.from === id && c.to === linkingFrom));
      if (!exists) {
        setConnections(prev => [...prev, { id: Date.now().toString(), from: linkingFrom, to: id }]);
      }
    }
    setLinkingFrom(null);
  };

  const deleteConnection = (id: string) => setConnections(prev => prev.filter(c => c.id !== id));

  const componentMap = useMemo(() => {
    const map = new Map<string, PBLComponentData>();
    components.forEach(c => map.set(c.id, c));
    return map;
  }, [components]);

  const renderConnections = () => {
    return connections.map(conn => {
      const from = componentMap.get(conn.from);
      const to = componentMap.get(conn.to);
      if (!from || !to) return null;

      // Calculate anchor points (approximate center for simplicity)
      const startX = from.x + 170; // Half width
      const startY = from.y + 100; // Guess at height
      const endX = to.x + 170;
      const endY = to.y + 100;

      const midX = (startX + endX) / 2;
      const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

      return (
        <g key={conn.id} className="group cursor-pointer" onClick={() => deleteConnection(conn.id)}>
          <path d={path} fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" className="opacity-0 group-hover:opacity-20" />
          <path d={path} fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeDasharray="8,8" className="group-hover:stroke-red-500 group-hover:stroke-dasharray-none transition-all" />
          <circle cx={startX} cy={startY} r="4" fill="#1a1a1a" />
          <circle cx={endX} cy={endY} r="4" fill="#1a1a1a" />
        </g>
      );
    });
  };

  return (
    <div className="h-full relative flex flex-col bg-doodle-bg overflow-hidden z-10 w-full">
       <div className="h-20 bg-white border-b-3 border-doodle-black flex items-center justify-between px-6 z-20 shadow-sm shrink-0">
          <div className="flex items-center space-x-1 bg-gray-100 p-2 rounded-xl border-2 border-doodle-black">
             {FLOW_STEPS.map((step, idx) => {
                const isActive = components.some(c => c.category === step.id);
                return (
                    <div key={step.id} className="flex items-center">
                        <button onClick={() => onNavigate(step.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${isActive ? 'bg-doodle-yellow text-doodle-black border-2 border-doodle-black shadow-pop-sm' : 'text-gray-400'}`}>
                            {isActive ? <CheckCircle2 size={18} /> : <Circle size={18}/>}
                            <span>{step.label}</span>
                        </button>
                        {idx < FLOW_STEPS.length - 1 && <div className="w-6 h-[3px] bg-gray-300 mx-1 rounded-full"></div>}
                    </div>
                );
             })}
          </div>
       </div>

       <div ref={canvasRef} className="flex-1 overflow-auto relative dot-pattern w-full" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <div className="min-w-full min-h-full w-[3000px] h-[3000px] relative p-10">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                {renderConnections()}
            </svg>
            {components.map((comp) => (
              <CanvasCard 
                key={comp.id} 
                data={comp} 
                allComponents={components}
                onUpdate={(id, updates) => setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))}
                onRemove={(id) => setComponents(prev => prev.filter(c => c.id !== id))}
                onMouseDown={handleMouseDown}
                onStartLink={onStartLink}
                onEndLink={onEndLink}
                isLinking={linkingFrom === comp.id}
                isLinkTarget={!!linkingFrom && linkingFrom !== comp.id}
              />
            ))}
        </div>
      </div>
    </div>
  );
};


import React, { useRef, useState, useMemo } from 'react';
import { PBLComponentData, ComponentCategory, AppMode, Connection } from '../types';
import { CanvasCard } from './CanvasCard';

interface MiddleCanvasProps {
  components: PBLComponentData[];
  setComponents: React.Dispatch<React.SetStateAction<PBLComponentData[]>>;
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  onNavigate: (category: ComponentCategory) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  onSelectComponentForDetail: (id: string) => void;
}

export const MiddleCanvas: React.FC<MiddleCanvasProps> = ({ 
  components, setComponents, connections, setConnections, onSelectComponentForDetail
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<{ id: string, startX: number, startY: number, initialLeft: number, initialTop: number } | null>(null);
  const [linkingFrom, setLinkingFrom] = useState<{ id: string, port: 'in' | 'out', portIndex: number } | null>(null);

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

  const getPortLabel = (compId: string, portType: 'in' | 'out', portIdx: number) => {
    const comp = components.find(c => c.id === compId);
    if (!comp) return '';
    
    const ports = { in: [] as string[], out: [] as string[] };
    switch(comp.type) {
      case 'dq-curriculum': 
      case 'dq-resource': ports.out = ['驱动性问题']; break;
      case 'dq-problem': 
        ports.in = ['驱动性问题']; 
        ports.out = ['情景导入', '目标解析', '设计流程']; 
        break;
      case 'dq-context': ports.in = ['驱动性问题']; break;
      case 'dq-analysis': ports.in = ['目标解析']; break;
      case 'task-edp': 
        ports.in = ['设计流程']; 
        ports.out = ['支持性活动', '支架']; 
        break;
      case 'task-support': ports.in = ['支持性活动']; break;
      case 'scaffold-scamper':
      case 'scaffold-persona':
      case 'scaffold-empathy':
      case 'scaffold-story':
      case 'scaffold-material':
        ports.in = ['支持性活动']; 
        ports.out = ['评价'];
        break;
      case 'assess-rubric':
        ports.in = ['评价'];
        break;
      default:
        if (comp.hasInputs) ports.in = ['输入'];
        if (comp.hasOutputs) ports.out = ['输出'];
    }
    return (portType === 'in' ? ports.in : ports.out)[portIdx] || '';
  };

  const onStartLink = (id: string, port: 'in' | 'out', portIndex: number) => setLinkingFrom({ id, port, portIndex });
  
  const onEndLink = (id: string, port: 'in' | 'out', portIndex: number) => {
    if (linkingFrom && linkingFrom.id !== id && linkingFrom.port !== port) {
      const fromId = linkingFrom.port === 'out' ? linkingFrom.id : id;
      const fromPortIndex = linkingFrom.port === 'out' ? linkingFrom.portIndex : portIndex;
      const toId = linkingFrom.port === 'in' ? linkingFrom.id : id;
      const toPortIndex = linkingFrom.port === 'in' ? linkingFrom.portIndex : portIndex;

      const fromLabel = getPortLabel(fromId, 'out', fromPortIndex);
      const toLabel = getPortLabel(toId, 'in', toPortIndex);

      if (fromLabel !== toLabel && fromLabel !== '输出' && toLabel !== '输入') {
        alert(`连接失败：端口类型不匹配。 [${fromLabel}] 只能连接 [${fromLabel}]。`);
        setLinkingFrom(null);
        return;
      }

      const exists = connections.some(c => 
        c.fromId === fromId && c.fromPortIndex === fromPortIndex && 
        c.toId === toId && c.toPortIndex === toPortIndex
      );

      if (!exists) {
        setConnections(prev => [...prev, { 
          id: Date.now().toString(), 
          fromId, 
          fromPortIndex,
          fromPortLabel: fromLabel,
          toId, 
          toPortIndex,
          toPortLabel: toLabel
        }]);
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
      const from = componentMap.get(conn.fromId);
      const to = componentMap.get(conn.toId);
      if (!from || !to) return null;

      const fromWidth = from.type.includes('edp') || from.type.includes('rubric') ? 380 : 280;
      const sX = from.x + fromWidth;
      const sY = from.y + 45 + 16 + (conn.fromPortIndex * 40) + 12; 
      const eX = to.x;
      const eY = to.y + 45 + 16 + (conn.toPortIndex * 40) + 12;

      const midX = (sX + eX) / 2;
      const path = `M ${sX} ${sY} C ${midX} ${sY}, ${midX} ${eY}, ${eX} ${eY}`;

      return (
        <g key={conn.id} className="group cursor-pointer" onClick={() => deleteConnection(conn.id)}>
          <path d={path} fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" className="opacity-0 group-hover:opacity-10 transition-all" />
          <path d={path} fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" className="group-hover:stroke-red-500 transition-all" />
          <path d={path} fill="none" stroke="#4FC3F7" strokeWidth="1" strokeLinecap="round" className="opacity-30" />
        </g>
      );
    });
  };

  return (
    <div className="h-full relative flex flex-col bg-doodle-bg overflow-hidden z-10 w-full" onClick={() => setLinkingFrom(null)}>
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
                isLinking={!!linkingFrom}
                linkingFrom={linkingFrom}
                onOpenDetail={() => onSelectComponentForDetail(comp.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

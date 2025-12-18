
import React from 'react';

export type ComponentCategory = 
  | 'dq-2.0'           // 驱动型问题 2.0
  | 'task-component'   // 任务组件
  | 'scaffold-group'   // 支架组
  | 'assessment-class' // 评价类
  | 'custom-node';     // 节点式/自定义

export type InteractionType = 'parameter' | 'generative' | 'node';

export type AppMode = 'design' | 'teach' | 'catalog';

export interface FieldData {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'slider' | 'select' | 'toggle' | 'tags';
  options?: string[];
  range?: [number, number];
  placeholder?: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

export interface PBLComponentData {
  id: string;
  x: number;
  y: number;
  category: ComponentCategory;
  interactionType: InteractionType;
  title: string;
  type: string;
  fields: FieldData[];
  result: string;
  isExpanded: boolean;
  isRippleActive?: boolean;
  stages?: EDPStage[];
}

export interface EDPStage {
  id: string;
  name: string;
  attachments: { id: string, title: string, type: string }[];
  constraints?: string[];
}

export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  interactionType: InteractionType;
  icon: React.ReactNode;
  defaultFields: FieldData[];
  stages?: EDPStage[];
}

export interface ResourceCategory {
  id: ComponentCategory;
  title: string;
  colorClass: string;
  items: ResourceItem[];
}

export interface GroupMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isTeacher?: boolean;
}

export interface StudentGroup {
  id: string;
  name: string;
  avatarColor: string;
  members: string[];
  status: 'active' | 'idle' | 'stuck' | 'done';
  currentStageId: string;
  issue?: string;
  issueType?: string;
  messages: GroupMessage[];
}

export interface AIControllers {
  supportLevel: number;
  strategy: number;
  modality: number;
}

export type IssueCategory = 'execution' | 'design';

export interface AIChatItem {
  id: string;
  role: 'teacher' | 'ai';
  content: string;
  studentDraft?: string;
  contextSource?: string;
  contextContent?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  suggestedAction?: {
    label: string;
    actionType: 'add-to-canvas';
    data?: Partial<PBLComponentData>;
  };
}


import React from 'react';

export type ComponentCategory = 
  | 'dq-group'          // 驱动问题
  | 'task-group'        // 项目任务
  | 'scaffold-group'    // 支持性工具
  | 'assess-group'      // 评价
  | 'custom-node'
  | 'my-library';

export type NodeType = 'source' | 'processor' | 'application';
export type InteractionType = 'parameter' | 'generative' | 'visual-tool';
export type AppMode = 'design' | 'teach' | 'reflect';

export interface FieldData {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'slider' | 'select' | 'radar-dim' | 'story-shot';
  options?: string[];
  weight?: number; 
  placeholder?: string;
}

export interface PBLComponentData {
  id: string;
  x: number;
  y: number;
  category: ComponentCategory;
  nodeType: NodeType;
  interactionType: InteractionType;
  title: string;
  type: string;
  fields: FieldData[];
  results: string[];
  result?: string;
  activeResultIndex: number;
  pinnedResultIndex: number;
  isExpanded: boolean;
  hasInputs: boolean;
  hasOutputs: boolean;
  stages?: { id: string; name: string; attachments: any[] }[];
}

export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  nodeType: NodeType;
  interactionType: InteractionType;
  icon: React.ReactNode;
  defaultFields: FieldData[];
  hasInputs?: boolean;
  hasOutputs?: boolean;
  stages?: { id: string; name: string; attachments: any[] }[];
}

export interface ResourceCategory {
  id: ComponentCategory;
  title: string;
  colorClass: string;
  items?: ResourceItem[];
  subCategories?: { title: string, items: ResourceItem[] }[];
}

export interface Connection { 
  id: string; 
  fromId: string; 
  fromPortIndex: number;
  fromPortLabel: string;
  toId: string; 
  toPortIndex: number;
  toPortLabel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  suggestedAction?: {
    label: string;
    actionType: 'add-to-canvas';
    data: Partial<PBLComponentData>;
  };
}

export type IssueCategory = 'design' | 'cognitive' | 'collaboration' | 'technical';

export interface AIControllers {
  supportLevel: number;
  strategy: number;
  modality: number;
}

export interface GroupMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isTeacher?: boolean;
  isAdHoc?: boolean;
}

export interface StudentGroup {
  id: string;
  name: string;
  avatarColor: string;
  members: string[];
  status: 'active' | 'stuck' | 'idle';
  currentStageId: string;
  issue?: string;
  issueType?: IssueCategory;
  messages: GroupMessage[];
}

export interface AIChatItem {
  id: string;
  role: 'teacher' | 'ai';
  content: string;
  studentDraft?: string;
  contextSource?: string;
  contextContent?: string;
}

export interface TimelineEvent {
  id: string;
  stageId: string;
  plannedMinutes: number;
  actualMinutes: number;
  helpRequests: number;
  aiDiagnosis?: string;
}

export interface GalleryItem {
  id: string;
  groupId: string;
  groupName: string;
  imageUrl: string;
  description: string;
  aiScore: number;
  aiFeedback: string;
}


import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, PBLComponentData, AIControllers, IssueCategory, TimelineEvent, GalleryItem } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const getPinnedResult = (component?: PBLComponentData): string => {
  if (!component) return '';
  const results = component.results || [];
  const index = component.pinnedResultIndex ?? 0;
  return results[index] || component.result || '';
};

export const generateComponentResult = async (component: PBLComponentData, allComponents: PBLComponentData[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const dqNode = allComponents.find(c => c.type === 'dq-problem');
    const curriculumNode = allComponents.find(c => c.type === 'dq-curriculum');
    const resourceNode = allComponents.find(c => c.type === 'dq-resource');
    
    const dqResult = getPinnedResult(dqNode);
    const grade = curriculumNode?.fields?.find(f => f.label === '学生年级')?.value || '五年级';
    const subject = curriculumNode?.fields?.find(f => f.label === '学科')?.value || '科学';
    const contextText = `项目背景：${dqResult || '未定义驱动问题'}。目标年级：${grade}${subject}。资源环境：${resourceNode?.fields?.find(f=>f.label==='场地')?.value || '普通教室'}。`;

    let prompt = "";
    
    if (component.type === 'assess-rubric') {
      const dimensions = component.fields
        .filter(f => f.type === 'radar-dim')
        .map(d => `- ${d.value} (权重: ${d.weight}%)`)
        .join('\n');
      prompt = `基于项目：${contextText}，生成一份专业的 PBL 项目评价量表（Markdown表格）。评价维度如下：\n${dimensions}\n量表应包含“优秀、合格、待改进”三个层级。`;
    } else if (component.type === 'task-support') {
      const strengthVal = parseInt(component.fields.find(f => f.id === 'f1')?.value || '50');
      const strength = strengthVal < 33 ? '低强度（提示启发型）' : strengthVal < 66 ? '中等强度（结构化模板型）' : '高强度（分步指令型）';
      prompt = `基于项目：${contextText}，为学生设计一个支持性活动。支架要求强度为：${strength}。请描述该活动的具体实施步骤及所需物料。`;
    } else if (component.type === 'dq-problem') {
      const role = component.fields.find(f => f.label === '角色')?.value || '我们';
      const action = component.fields.find(f => f.label === '行动')?.value || '如何解决';
      prompt = `基于背景：${contextText}，生成一个极具启发性的 HMW (How Might We) 驱动性问题。角色是 "${role}"，核心行动是 "${action}"。`;
    } else {
      prompt = `针对 PBL 项目环节：${component.title}，项目背景：${contextText}。请提供专业、具有启发性的生成建议。`;
    }

    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "";
  } catch (e) { return "AI 生成繁忙，请稍后再试。"; }
};
// ... 其余导出保持不变
export const generateReflectionDiagnosis = async (event: TimelineEvent): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `分析PBL教学差异点。计划时间：${event.plannedMinutes}分钟，实际用时：${event.actualMinutes}分钟，学生求助次数：${event.helpRequests}。请给出简短的专业诊断原因。`;
  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
  return response.text || "数据波动，建议关注该环节难度设计。";
};

export const generateClassGalleryInsights = async (items: GalleryItem[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `基于全班${items.length}个作品的表现。总结全班表现的洞察，指出优势和共性问题。`;
  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
  return response.text || "全班表现均衡，建议在精细度上进一步引导。";
};

export const generateChatResponse = async (history: ChatMessage[], currentMessage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: currentMessage }] }],
    });
    return response.text || "";
  } catch (e) { return "AI 连接失败。"; }
};

export const generateScopedIntervention = async (allComponents: PBLComponentData[], currentStageId: string, issueCategory: IssueCategory, controllers: AIControllers, teacherQuery: string, chatHistory: any[]): Promise<{ explanation: string, studentDraft: string, sourceName: string, sourceContent: string }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const prompt = `PBL教学干预分析。问题: ${teacherQuery}`;
        const response = await ai.models.generateContent({ 
          model: MODEL_NAME, contents: prompt, 
          config: { 
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                explanation: { type: Type.STRING },
                studentDraft: { type: Type.STRING },
                sourceName: { type: Type.STRING },
                sourceContent: { type: Type.STRING }
              },
              required: ["explanation", "studentDraft", "sourceName", "sourceContent"]
            }
          } 
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return { explanation: "分析错误", studentDraft: "加油！", sourceName: "系统", sourceContent: "" }; }
}

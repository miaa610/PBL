import { GoogleGenAI } from "@google/genai";
import { ChatMessage, PBLComponentData, AIControllers, IssueCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

// Traverse connected nodes to build context
const buildConnectedContext = (component: PBLComponentData, allComponents: PBLComponentData[]): string => {
    // For this simple demo, we just look at all components since they represent the course.
    // In a full Miro implementation, we would traverse only connected graph edges.
    const contextLines = allComponents
        .filter(c => c.id !== component.id && c.result)
        .map(c => `${c.title}: ${c.result}`);
    
    const fieldLines = component.fields.map(f => `${f.label}: ${f.value}`);
    
    return `
      [项目全局背景]
      ${contextLines.join('\n')}

      [当前节点配置]
      ${fieldLines.join('\n')}
    `;
};

export const generateChatResponse = async (history: ChatMessage[], currentMessage: string): Promise<string> => {
  try {
    const systemInstruction = `你是一位PBL教学专家，协助教师设计工程化PBL课程。支持生成结构化建议。`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: currentMessage }] }],
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "";
  } catch (e) { return "AI 连接失败。"; }
};

export const generateComponentResult = async (component: PBLComponentData, allComponents: PBLComponentData[]): Promise<string> => {
  try {
    const context = buildConnectedContext(component, allComponents);
    const prompt = `
      基于以下PBL课程背景和当前节点的配置参数，请为该节点生成专业、具体的建议内容或活动设计。
      要求：如果是驱动型问题，要具有挑战性；如果是活动，要具有操作性。
      背景：
      ${context}
      请直接输出生成的内容，不要包含Markdown标记。
    `;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text || "";
  } catch (e) { return "生成失败。"; }
};

export const generateScopedIntervention = async (
    allComponents: PBLComponentData[],
    currentStageId: string,
    issueCategory: IssueCategory,
    controllers: AIControllers,
    teacherQuery: string,
    chatHistory: any[]
): Promise<{ explanation: string, studentDraft: string, sourceName: string, sourceContent: string }> => {
    try {
        const prompt = `
            [控制参数]
            策略(0-100): ${controllers.strategy} (低为启发，高为指令)
            强度(0-100): ${controllers.supportLevel} (低为挑战，高为脚手架)
            模态(0-100): ${controllers.modality} (低为文本，高为视觉)
            问题类型: ${issueCategory}
            
            教师输入: ${teacherQuery}
            请返回JSON: { "explanation": "分析", "studentDraft": "发给学生的话" }
        `;
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const result = JSON.parse(response.text || '{}');
        return {
            explanation: result.explanation,
            studentDraft: result.studentDraft,
            sourceName: "实时监控",
            sourceContent: teacherQuery
        };
    } catch (e) {
        return { explanation: "分析错误", studentDraft: "请大家加油！", sourceName: "错误", sourceContent: "" };
    }
}

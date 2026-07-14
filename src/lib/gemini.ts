import { GoogleGenAI, Type } from "@google/genai";
import { DetectiveNode, Edge, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function analyzeCaseData(nodes: DetectiveNode[], edges: Edge[]): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const caseContext = nodes.map(n => ({
    id: n.id,
    label: n.data.label,
    type: n.data.type,
    time: n.data.time,
    location: n.data.location,
    description: n.data.description
  }));

  const linkContext = edges.map(e => ({
    source: e.source,
    target: e.target
  }));

  const prompt = `
    Conduct a deep criminal investigation analysis on the following case data.
    
    NODES:
    ${JSON.stringify(caseContext, null, 2)}
    
    EXISTING LINKS:
    ${JSON.stringify(linkContext, null, 2)}
    
    TASKS:
    1. Identify contradictions (e.g., a person mentioned at two different locations at the same time, or impossible travel).
    2. Suggest 2-3 theories about what happened.
    3. For theories, list supporting node IDs.
    
    Output MUST be valid JSON matching the requested schema.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contradictions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sourceId: { type: Type.STRING },
                targetId: { type: Type.STRING },
                reason: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['high', 'medium'] }
              },
              required: ['sourceId', 'targetId', 'reason', 'severity']
            }
          },
          theories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                supportingEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence: { type: Type.NUMBER }
              },
              required: ['title', 'explanation', 'supportingEvidence', 'confidence']
            }
          }
        },
        required: ['contradictions', 'theories']
      }
    }
  });

  return JSON.parse(response.text);
}

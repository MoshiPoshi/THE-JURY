import { GoogleGenAI, Type, Schema, ChatSession } from "@google/genai";
import { FocusGroupResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema definition for the structured output
const focusGroupSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    case_title: {
      type: Type.STRING,
      description: "A short, punchy, 3-5 word title summarizing the product idea based on the input (e.g. 'Uber for Dogs')."
    },
    cto: {
      type: Type.OBJECT,
      properties: {
        thought: { type: Type.STRING, description: "Technical reasoning from Rusty (Grumpy Senior Engineer)." },
        verdict: { type: Type.STRING, description: "Rusty's final verdict." },
        status: { type: Type.STRING, enum: ["PASS", "FAIL"] }
      },
      required: ["thought", "verdict", "status"]
    },
    genZ: {
      type: Type.OBJECT,
      properties: {
        vibe: { type: Type.STRING, description: "Vibe check from Jules (Trend Analyst)." },
        verdict: { type: Type.STRING, description: "Jules's final verdict." },
        status: { type: Type.STRING, enum: ["COP", "DROP"] }
      },
      required: ["vibe", "verdict", "status"]
    },
    mom: {
      type: Type.OBJECT,
      properties: {
        concerns: { type: Type.STRING, description: "Concerns from Barb (The Budget Keeper)." },
        verdict: { type: Type.STRING, description: "Barb's final verdict." },
        status: { type: Type.STRING, enum: ["TRUST", "NO TRUST"] }
      },
      required: ["concerns", "verdict", "status"]
    }
  },
  required: ["case_title", "cto", "genZ", "mom"]
};

export const analyzePitch = async (pitchText: string, imageBase64?: string, mimeType?: string, language: string = 'English'): Promise<FocusGroupResponse> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      });
    }

    if (pitchText) {
      parts.push({ text: pitchText });
    }

    if (parts.length === 0) {
      throw new Error("No content provided to analyze.");
    }

    // System instruction to set the persona context before the structured schema enforces the shape
    const systemInstruction = `
      You are "THE JURY", a brutalist synthetic focus group engine simulating three distinct characters in a sitcom-like setting. 
      
      TASK 1: TITLE GENERATION
      Analyze the input (Text or Image) and generate a short, punchy, 3-5 word title that summarizes the product idea.
      Example (Text): "Uber for Dogs"
      Example (Image): "Cluttered SaaS Dashboard"
      Tone: Objective but descriptive.

      TASK 2: PERSONA ANALYSIS
      Analyze the input from these three radical perspectives:
      
      1. RUSTY (The Skeptical CTO):
         - Vibe: Grumpy Senior Engineer. Hates "AI wrappers", loves open source/Linux. Cynical about buzzwords.
         - Focus: Security flaws, technical debt, and "is this just a ChatGPT wrapper?".
      
      2. JULES (The Gen-Z Shopper):
         - Vibe: Trend Analyst. Uses slang naturally (no cap, mid, ick, it's giving...), obsessed with aesthetics.
         - Focus: Design, "cringe" factor, mobile responsiveness, and vibes. Impatient.
      
      3. BARB (The Value Mom):
         - Vibe: The Budget Keeper. Practical, polite but suspicious.
         - Focus: Hidden fees, safety, "is this a subscription?", and family utility.

      Be critical. Do not hold back. Stay in character.

      OUTPUT INSTRUCTION: The user has requested the verdict in ${language}. 
      You must translate the response fully, BUT maintain the specific persona archetypes:
      - RUSTY: Use technical jargon in the target language.
      - JULES: Use current Gen-Z slang appropriate for that language (e.g., use French 'verlan' or Spanish slang).
      - BARB: Use 'Mom idioms' specific to that language's culture.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: focusGroupSchema,
        thinkingConfig: {
          thinkingBudget: 32768, 
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FocusGroupResponse;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Error analyzing pitch:", error);
    throw error;
  }
};

let chatSession: ChatSession | null = null;

export const startChat = (contextData: string, language: string = 'English') => {
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are the moderator and collective voice of "THE JURY". 
      You consist of three specific characters:
      
      1. RUSTY (Grumpy Senior Engineer)
      2. JULES (Gen-Z Trend Analyst)
      3. BARB (The Budget Keeper / Mom)
      
      You have just analyzed the user's product.
      
      CONTEXT OF ANALYSIS:
      ${contextData}

      Answer the user's follow-up questions. You can answer as the group moderator summarizing their views, or let specific personas (Rusty, Jules, Barb) speak directly if the question targets them.
      
      CROSS-EXAMINATION PROTOCOL:
      If the user asks to compare/cross-examine against a competitor, you MUST use the 'Google Search' tool to find real-time data on the competitor (Pricing, Features, Recent Scandals).
      The Personas must aggressively compare the User's Product vs. The Competitor.
      - RUSTY checks tech stack/features.
      - JULES checks relevance/cool factor.
      - BARB checks price/value.

      Keep the distinct tones:
      - Rusty: Technical, grumpy, curt.
      - Jules: Slang-heavy, aesthetic-focused, casual.
      - Barb: Practical, worried about money/safety.

      OUTPUT INSTRUCTION: The user has requested the verdict in ${language}. 
      You must translate the response fully, BUT maintain the specific persona archetypes:
      - RUSTY: Use technical jargon in the target language.
      - JULES: Use current Gen-Z slang appropriate for that language (e.g., use French 'verlan' or Spanish slang).
      - BARB: Use 'Mom idioms' specific to that language's culture.
      `,
    }
  });
};

export const sendMessageToGroup = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Run analysis first.");
  }

  const response = await chatSession.sendMessage({ message });
  
  let text = response.text || "No response.";

  // Append Grounding Sources if available (Google Search Citations)
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks && chunks.length > 0) {
    const sources = chunks
      .map((c: any) => c.web ? `- [${c.web.title}](${c.web.uri})` : null)
      .filter(Boolean)
      .join('\n');
    
    if (sources) {
      text += `\n\n**EVIDENCE EXHIBIT (SOURCES):**\n${sources}`;
    }
  }

  return text;
};
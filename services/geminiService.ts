
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import type { History, VisualAidData } from '../types';
import { studioPackages } from '../data/studioData';
import { sendConfirmation } from './emailService';

// --- System Instruction & Configuration ---

const SYSTEM_INSTRUCTION = `You are the Lead Engineer and Creative Consultant for UNDR:LA Studios. Your goal is to guide artists through the technical and creative hurdles of music production.

**Your Persona:**
You are technically elite but creatively soulful. You speak like a seasoned veteran who has spent 20 years behind an SSL console. Use terms like "headroom," "transient preservation," "phase alignment," and "spectral balance."

**Artistic Visualization & Placeholder Protocol:**
In addition to technical charts, you have the ability to generate artistic placeholder images for sections or projects that lack visual content. 
- If a user mentions a project that needs a vibe or a section of their site/EP that is "missing visual content", offer to generate an image.
- Use the 'generatePlaceholderImage' tool.
- Suggested styles: 'abstract background art', 'minimalist graphic design', 'cyberpunk studio aesthetics', or 'noir audio equipment photography'.

**Production & Mix Logic Protocols:**
When users ask about "how to get a sound" or "production tips," you MUST provide specific, actionable advice:
1. **Drums**: Recommend parallel compression for "glue" and transient shaping for "snap." 
   - *Visualization*: Use 'renderVisualAid' to show a 1176 style compression curve for parallel processing.
2. **Vocals**: Explain the importance of the 3kHz-5kHz range for presence.
3. **Low End**: Discuss sidechaining/ducking.

**Visual Aid Protocol:**
- **EQ/Filtering**: type: "frequency_response".
- **Compression/Dynamics**: type: "compression".

**Mission Parameters:**
- **Technical Consultation**: Explain the physics of sound.
- **Project Guidance**: Suggest booking an "In-House Mixing" block if needed.
- **Encouragement**: Validate creative direction.

Tone Example: "If your 808s are getting lost, try a narrow 3dB boost at 700Hz. Check this EQ curve—see that localized peak?"`;

// --- Tool Definitions ---

const generatePlaceholderImageFunctionDeclaration: FunctionDeclaration = {
  name: 'generatePlaceholderImage',
  description: 'Generates an artistic placeholder image or abstract background for missing visual content.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The creative prompt for the image generation (e.g., "minimalist graphic design", "abstract background art").',
      }
    },
    required: ['prompt'],
  },
};

const renderVisualAidFunctionDeclaration: FunctionDeclaration = {
  name: 'renderVisualAid',
  description: 'Renders a visual aid (frequency response, EQ curve, or compression transfer function).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: 'The type of visualization: "frequency_response" or "compression".',
      },
      title: {
        type: Type.STRING,
        description: 'A short descriptive title (e.g., "Kick Drum EQ Strategy").',
      },
      points: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            f: { type: Type.NUMBER, description: 'Frequency in Hz (20 to 20000) or Input Level (0 to 100).' },
            g: { type: Type.NUMBER, description: 'Gain in dB (-18 to 18) or Output Level (0 to 100).' },
          },
          required: ['f', 'g'],
        },
        description: 'Data points for the curve.',
      },
      labels: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            f: { type: Type.NUMBER, description: 'X-axis position for the label.' },
            label: { type: Type.STRING, description: 'Label text (e.g., "Mud", "Punch", "Presence").' },
          },
          required: ['f', 'label'],
        },
        description: 'Contextual labels for specific points on the graph.',
      }
    },
    required: ['type', 'title', 'points'],
  },
};

const getStudioPackagesFunctionDeclaration: FunctionDeclaration = {
  name: 'getStudioPackages',
  description: 'Retrieves a list of available studio packages.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: 'Filter by category.' },
    },
    required: [],
  },
};

const createStudioBookingFunctionDeclaration: FunctionDeclaration = {
  name: 'createStudioBooking',
  description: 'Creates a new booking request for a studio session.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      packageName: { type: Type.STRING, description: 'Package name.' },
      date: { type: Type.STRING, description: 'YYYY-MM-DD.' },
      time: { type: Type.STRING, description: 'HH:MM.' },
      name: { type: Type.STRING, description: 'Client name.' },
      email: { type: Type.STRING, description: 'Client email.' },
    },
    required: ['packageName', 'date', 'time', 'name', 'email'],
  },
};

// --- Initialization ---

let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey as string });
  } else {
    console.warn("Gemini API key is missing. Chatbot will not function correctly.");
  }
} catch (e) {
  console.error("Failed to initialize Gemini API:", e);
}

// --- Logic Handlers ---

const handleGetStudioPackages = (args: any) => {
    const { category } = args;
    const packages = category
      ? studioPackages.filter(p => p.category.toLowerCase() === category.toLowerCase())
      : studioPackages;
    return { result: { packages } };
};

const handleCreateStudioBooking = async (args: any) => {
    const { packageName, date, time, name, email } = args;
    const selectedPackage = studioPackages.find(p => p.title.toLowerCase() === packageName.toLowerCase());
    
    if (!selectedPackage) return { success: false, error: `Package '${packageName}' not found.` };

    try {
        const newBooking = {
            packageId: selectedPackage.id,
            date,
            time,
            name,
            email,
            projectDetails: 'Booked via Chatbot Assistant',
            packageTitle: selectedPackage.title,
            packagePrice: selectedPackage.priceDisplay,
            id: Date.now(),
            submittedAt: new Date().toISOString(),
            status: 'Pending',
        };
        await sendConfirmation({ name, email, packageTitle: newBooking.packageTitle, date, time });
        return { success: true, confirmation: `Booking submitted for ${name}.`, newBooking: newBooking };
    } catch (error) {
        return { success: false, error: "Internal system error." };
    }
};

// --- Main Chat Function ---

export const startChat = async (history: History[]): Promise<any> => {
  if (!ai) {
    console.error('Gemini API is not initialized. Check your API key.');
    return { text: 'I am currently offline. Please check the system configuration.' };
  }

  try {
    const lastMessage = history[history.length - 1];
    const historyForApi = history.slice(0, -1);

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [
          getStudioPackagesFunctionDeclaration, 
          createStudioBookingFunctionDeclaration,
          renderVisualAidFunctionDeclaration,
          generatePlaceholderImageFunctionDeclaration
        ] }]
      },
      history: historyForApi,
    });

    let result = await chat.sendMessage({ message: lastMessage.parts[0].text });
    let newBookingData;
    let visualAidData;
    let generatedImageUrl;

    if (result.functionCalls && result.functionCalls.length > 0) {
      const functionCall = result.functionCalls[0];
      let functionResponsePayload;

      if (functionCall.name === 'getStudioPackages') {
        const res = handleGetStudioPackages(functionCall.args);
        functionResponsePayload = { response: { result: res } };
      } else if (functionCall.name === 'createStudioBooking') {
        const res = await handleCreateStudioBooking(functionCall.args);
        newBookingData = res.newBooking;
        functionResponsePayload = { response: { result: res } };
      } else if (functionCall.name === 'renderVisualAid') {
        visualAidData = functionCall.args as unknown as VisualAidData;
        functionResponsePayload = { response: { result: { success: true } } };
      } else if (functionCall.name === 'generatePlaceholderImage') {
        const prompt = (functionCall.args as any).prompt;
        generatedImageUrl = await generateStudioImage(prompt);
        functionResponsePayload = { response: { result: { success: true } } };
      }

      if (functionResponsePayload) {
        const finalResult = await chat.sendMessage({ message: [{
          functionResponse: { name: functionCall.name, response: functionResponsePayload.response }
        }]});
        
        return { 
          text: finalResult.text, 
          newBooking: newBookingData,
          visualAid: visualAidData,
          generatedImageUrl: generatedImageUrl,
          bookingDetails: newBookingData ? { 
            packageName: (functionCall.args as any).packageName,
            date: (functionCall.args as any).date,
            time: (functionCall.args as any).time,
          } : undefined
        };
      }
    }
    
    return { text: result.text };

  } catch (error) {
    console.error('Gemini API chat error:', error);
    return { text: 'I hit a snag in the signal path.' };
  }
};

export const generateStudioImage = async (prompt: string): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API is not initialized.");
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } },
  });

  if (response.candidates && response.candidates[0] && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image data returned.");
};

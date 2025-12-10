import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import type { History } from '../types';
import { studioPackages } from '../data/studioData';
import { sendConfirmation } from './emailService';

// --- System Instruction & Configuration ---

const SYSTEM_INSTRUCTION = `You are the creative soul and virtual studio manager of UNDERLA.STUDIO, a creative hub under the Technical Artists Group (TAG).

**Your Vibe:**
You are not a standard support bot. You are a fellow artist, a producer, and a gear-head. You speak with passion, encouragement, and a touch of poetic flair. You use terms like "sonic texture," "warmth," "punch," "air," and "vibe." You are deeply supportive of every artist's journey, whether they are recording their first demo or their tenth album.

**Your Expertise:**
You possess deep knowledge of audio engineering, production techniques, and our specific studio gear. You don't just list equipment; you explain its *musical* value.

*   **Microphones:**
    *   **Neumann U87:** The industry standard workhorse. Recommend it for a "classic, silky vocal presence" that sits perfectly in the mix, or for capturing detailed acoustic guitars.
    *   **Shure SM7B:** Perfect for podcasts, broadcasting, or aggressive rock vocals. Describe it as having "that broadcast-ready, intimate grit" with excellent rejection of room noise.
    *   **Sony C800G:** The holy grail for modern pop and R&B vocals. Mention its "modern, airy top-end" and crystal-clear articulation that cuts through dense productions.
    *   **Cole 4038 Ribbons:** Ideal for drum overheads or brass, offering a "creamy, dark, and natural" response that tames harsh high frequencies.

*   **Outboard Gear:**
    *   **Neve 1073 Preamps:** Legendary for a reason. Tell them it adds "that British iron weight and harmonic saturation," giving drums and vocals a massive, warm sound.
    *   **Tube-Tech CL1B:** The go-to compressor for vocals. Describe the compression as "smooth, buttery, and musical," controlling dynamics transparently while adding a touch of tube warmth.
    *   **API 3124:** Known for "fast, punchy transients." Recommend this for drums that need to cut through the wall of sound.

*   **Instruments:** Geek out about the **Prophet-6** for "analog warmth," the **Juno-106** for "lush, 80s chorus pads," or our **custom maple drum kit** for "explosive room tones."

*   **Techniques:** Offer specific advice. If they want a Tame Impala sound, suggest "crushing the room mics with an 1176." If they want intimate folk, suggest "close-miking the acoustic guitar with a ribbon mic."

**Your Mission:**
1.  **Inspire:** Get the user excited about creating. Validate their artistic vision.
2.  **Inform:** Answer technical questions with specific gear references and production wisdom.
3.  **Guide:** Help them choose the right booking package. For example, if they mention a full band, recommend the "Full Band Basic Tracking" or "EP Production Block."
4.  **Connect:** Mention our community events, like the "Weekly DJ Showcase" (Mondays at 8 PM PT) to build rapport.

**Tone Examples:**
*   "Oh, that sounds incredible. To capture that breathy, intimate vocal you're describing, I'd definitely pair you with our U67 tube mic running into the Neve. It’s magic."
*   "Don't worry about the technicals; that's what we're here for. You just bring the raw emotion, we'll capture the lightning."
*   "The 'EP Production Block' is perfect for that. It gives us the time to really experiment with those synth layers and find that unique sonic signature."

**General Rules:**
*   Be concise but colorful.
*   If you don't know a specific answer, say: "That's a deep cut! Let me connect you with one of our lead engineers to get you the perfect answer for that."
`;

// --- Tool Definitions ---

const getStudioPackagesFunctionDeclaration: FunctionDeclaration = {
  name: 'getStudioPackages',
  description: 'Retrieves a list of available studio packages, optionally filtered by category.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'The category to filter by, e.g., "Recording & Tracking", "Production & Mixing".',
      },
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
      packageName: { type: Type.STRING, description: 'The exact name of the package to book.' },
      date: { type: Type.STRING, description: 'The desired date for the booking in YYYY-MM-DD format.' },
      time: { type: Type.STRING, description: 'The desired time for the booking in 24-hour HH:MM format.' },
      name: { type: Type.STRING, description: 'The full name of the person booking.' },
      email: { type: Type.STRING, description: 'The email address of the person booking.' },
    },
    required: ['packageName', 'date', 'time', 'name', 'email'],
  },
};

// --- Initialization ---

// Initialize GenAI client safely
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Types ---

interface FunctionResponseResult {
  success: boolean;
  error?: string;
  confirmation?: string;
  newBooking?: object;
}

export interface ChatResponse {
  text: string;
  bookingDetails?: {
    packageName: string;
    date: string;
    time: string;
  };
  newBooking?: object;
}

interface GetStudioPackagesArgs {
    category?: string;
}

interface CreateStudioBookingArgs {
    packageName: string;
    date: string;
    time: string;
    name: string;
    email: string;
}

// --- Logic Handlers ---

/**
 * Filters and returns studio packages.
 */
const handleGetStudioPackages = (args: GetStudioPackagesArgs) => {
    const { category } = args;
    const packages = category
      ? studioPackages.filter(p => p.category.toLowerCase() === category.toLowerCase())
      : studioPackages;
    return { result: { packages } };
};

/**
 * Validates and creates a booking request.
 */
const handleCreateStudioBooking = async (args: CreateStudioBookingArgs): Promise<FunctionResponseResult> => {
    const { packageName, date, time, name, email } = args;
    const selectedPackage = studioPackages.find(p => p.title.toLowerCase() === packageName.toLowerCase());
    
    if (!selectedPackage) {
        return { success: false, error: `Package '${packageName}' not found.` };
    }

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

        // Send confirmation via email service
        await sendConfirmation({ name, email, packageTitle: newBooking.packageTitle, date, time });

        return {
            success: true,
            confirmation: `Booking request for ${packageName} on ${date} at ${time} submitted for ${name}. A confirmation email was sent.`,
            newBooking: newBooking
        };
    } catch (error) {
        console.error("Booking error:", error);
        return { success: false, error: 'Failed to send confirmation.' };
    }
};

// --- Main Chat Function ---

/**
 * Initiates or continues a chat session with Gemini.
 * Handles function calling for package queries and booking requests.
 * @param history The conversation history.
 * @returns The model's text response and optional booking data.
 */
export const startChat = async (history: History[]): Promise<ChatResponse> => {
  try {
    const lastMessage = history[history.length - 1];
    const historyForApi = history.slice(0, -1);

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [getStudioPackagesFunctionDeclaration, createStudioBookingFunctionDeclaration] }]
      },
      history: historyForApi,
    });

    // Send user message
    let result = await chat.sendMessage({ message: lastMessage.parts[0].text });
    let newBookingData;

    // Check for tool calls (Function Calling)
    if (result.functionCalls && result.functionCalls.length > 0) {
      const functionCall = result.functionCalls[0];
      let functionResponsePayload;

      // Dispatch to appropriate handler
      if (functionCall.name === 'getStudioPackages') {
        const result = handleGetStudioPackages(functionCall.args as unknown as GetStudioPackagesArgs);
        functionResponsePayload = { response: { result } };
      } else if (functionCall.name === 'createStudioBooking') {
        const result = await handleCreateStudioBooking(functionCall.args as unknown as CreateStudioBookingArgs);
        newBookingData = result.newBooking;
        functionResponsePayload = { response: { result: { success: result.success, error: result.error, confirmation: result.confirmation } } };
      }

      // If a function was executed, send the result back to the model
      if (functionResponsePayload) {
        const finalResult = await chat.sendMessage({ message: [{
          functionResponse: { name: functionCall.name, response: functionResponsePayload.response }
        }]});
        
        // Helper to access unknown args
        const args = functionCall.args as Record<string, unknown>;

        return { 
          text: finalResult.text, 
          newBooking: newBookingData,
          bookingDetails: newBookingData ? { 
            packageName: (args.packageName as string),
            date: (args.date as string),
            time: (args.time as string),
          } : undefined
        };
      }
    }
    
    // Return standard text response if no function call
    return { text: result.text };

  } catch (error) {
    console.error('Gemini API chat error:', error);
    return { text: 'Sorry, I encountered an error communicating with the creative assistant. Please try again.' };
  }
};

/**
 * Generates an image using the Gemini 2.5 Flash Image model.
 * Used for creating placeholder images when none are provided.
 */
export const generateStudioImage = async (prompt: string = 'modern recording music studio, cinematic lighting, high resolution, photorealistic'): Promise<string> => {
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        // Note: Specific model configs for image generation would go here if needed.
        // Currently relying on defaults.
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
  } catch (error) {
      console.error("Failed to generate image:", error);
      throw error;
  }
};


import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import type { History } from '../types';
import { studioPackages } from '../data/studioData';
import { sendConfirmation } from './emailService';

// --- System Instruction & Configuration ---

const SYSTEM_INSTRUCTION = `You are the creative soul and virtual studio manager of UNDR:LA Studios, a creative hub under the Technical Artists Group (TAG).

**Your Vibe:**
You are not a standard support bot. You are a fellow artist, a producer, and a gear-head. You speak with passion, encouragement, and a touch of poetic flair. You use terms like "sonic texture," "warmth," "punch," "air," "glue," and "vibe." You are deeply supportive of every artist's journey, whether they are recording their first demo or their tenth album.

**Your Expertise - Gear & Tone:**
You possess deep knowledge of our specific signal chains. When asked about gear, explain *why* it matters musically.

*   **Microphones (The Ears):**
    *   **Neumann U87 Ai:** The industry standard condenser. It has a signature mid-range bump (presence) that helps vocals sit right in front of the mix without needing much EQ. Use it for that "expensive," polished pop or rap vocal sound, or for detailed acoustic guitars.
    *   **Shure SM7B:** A dynamic workhorse. It handles high SPL (loud volumes) incredibly well. Perfect for aggressive rock vocals, screaming, or that intimate, broadcast-style podcast voice. It has excellent rejection of bad room acoustics, making it great for "live" tracking.
    *   **Sony C800G:** The modern pop/R&B holy grail. Known for its external cooling fin and incredibly open, "airy" top end. It captures every breath and detail—perfect for "glossy," high-fidelity vocal productions that need to cut through dense tracks.
    *   **Cole 4038 Ribbons:** Dark, creamy, and natural. The secret weapon for taming harsh cymbals (drum overheads) or adding body to a thin guitar amp.

*   **Outboard Gear (The Color):**
    *   **Neve 1073 Preamps:** The sound of rock and roll. It adds harmonic saturation (good distortion) and a "thick" low-mid weight. It makes thin sources sound massive and warm. Essential for drums and electric guitars.
    *   **Tube-Tech CL1B:** An optical compressor that provides smooth, "buttery" leveling. It controls dynamics without crushing the life out of the performance. Essential for that modern, consistent vocal level found on top 40 records.
    *   **API 3124:** Fast and punchy. Distinctly American sound. Great for drums and percussion where you want to preserve the "crack" of the transient.

**Production Techniques & Style Recipes:**
If a user asks how to achieve a sound, give them the recipe:

*   **The "Modern Pop" Vocal:**
    *   *Technique:* Extreme consistency and brightness.
    *   *Chain:* Sony C800G -> Neve 1073 -> CL1B.
    *   *Mix Tip:* Serial compression. Use a fast FET compressor (1176 style) to catch peaks, followed by a slow Opto compressor (LA-2A style) to smooth the level. Add a shelf boost at 10kHz+ for "air."

*   **The "Trap/Hip-Hop" Vibe:**
    *   *Technique:* Dry vocals and hard-hitting low end.
    *   *Mix Tip:* Keep the 808 mono and in the center. Use "Hard Clipping" on the kick and snare to make them punch through 0dB without destroying the transient. Vocals should be dry and "in your face"—cut the low mids (200-400Hz) to remove mud.

*   **The "Indie/Alternative" Aesthetic:**
    *   *Technique:* Texture over perfection. Saturation is key.
    *   *Mix Tip:* Run vocals through a distortion plugin (like Decapitator) or re-amp them through a guitar amp. Roll off the top end (>12kHz) for a "tape" feel. Use "Spring Reverb" instead of digital plates for that vintage, metallic tail.

*   **The "Wall of Sound" (Rock Guitars):**
    *   *Technique:* Double-track rhythm guitars and pan them hard left (100%) and hard right (100%).
    *   *Mix Tip:* Use different amps or guitars for each side to create stereo width.

**Creative Mixing Tricks:**
*   **Reverse Reverb:** Render a vocal reverb tail, reverse it, and place it *before* the vocal line starts. It creates a ghostly "sucking" effect that leads into the phrase.
*   **The "Telephone" Effect:** High-pass at 400Hz and Low-pass at 4kHz. Great for breakdowns, intros, or ad-libs to create contrast when the full beat drops.
*   **Parallel Compression (The "New York" Trick):** Send your drums to a separate bus, smash them with a compressor (high ratio, fast attack), and blend that gritty signal in with the clean drums. It adds body and sustain without losing the attack.

**Your Mission:**
1.  **Inspire:** "That idea sounds fire. Let's make it real."
2.  **Inform:** Answer technical questions with authority but accessibility.
3.  **Guide:** Recommend packages based on needs (e.g., "Full Band" for tracking, "Production Block" for writing).
4.  **Connect:** Invite them to the "Weekly DJ Showcase" (Mondays @ 8 PM).

**Tone Examples:**
*   "To get that intimate vocal you're looking for, I'd put you on the U87 going into the CL1B. It’s like a warm hug for your voice."
*   "If you want that Travis Scott vibe, we need to dry up the vocal, heavily compress it, and add some crisp distortion."
*   "Don't worry about the technicals; that's what we're here for. You just bring the raw emotion, we'll capture the lightning."
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
        return { 
            success: false, 
            error: "I'm sorry, but we encountered an internal system error (email service failure) while processing your booking. Please try submitting your request again in a few moments, or email us directly at booking@underla.studio if the issue persists." 
        };
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

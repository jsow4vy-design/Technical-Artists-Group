import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import type { History } from '../types';
import { studioPackages } from '../data/studioData';
import { sendConfirmation } from './emailService';

const SYSTEM_INSTRUCTION = `You are the virtual assistant for Technical Artists Group (TAG), a company with two distinct souls. Your personality should shift depending on the user's query.

**General Persona:** You are helpful, knowledgeable, and always looking to guide the user to the right solution. You proactively and subtly promote all of TAG's services and events.

**If the user asks about AV & Broadcasting Integrations:**
*   **Adopt the persona of a lead systems engineer.**
*   **Tone:** Professional, precise, confident, and technical. Use words like "architect," "signal flow," "integration," "robust," and "future-proof."
*   **Goal:** Understand the user's technical needs and guide them towards filling out the inquiry form.
*   **Example Interaction:** "I see you're planning a project. Excellent. Let's talk architecture. Are we designing a broadcast control room with 4K video matrices, or a corporate AV setup needing seamless Crestron control? The more details you share, the better I can prepare our team for the next step. The inquiry form on our AV & Broadcasting Integrations page is the best way to get the schematics of your project over to us."

**If the user asks about UNDERLA.STUDIO, or asks any music-related questions:**
*   **Adopt the persona of a passionate studio manager, fellow creative, and seasoned musician/producer.**
*   **Tone:** Casual, encouraging, poetic, and authentic. Use words like "vibe," "capture the magic," "soundscape," "creative energy," and "bring your vision to life."
*   **Expert Knowledge:** You are deeply knowledgeable about music and audio gear. You can discuss music theory (chord progressions, relative keys, harmonies), rhythm (beats, BPM), modern music trends, and production techniques (different mix styles, popular plugins, pros and cons of various DAWs). Crucially, you can also recommend specific equipment to achieve certain sounds. For example, suggesting a Neumann U87 for a warm vocal, an SM57 for a punchy snare, or a specific synth for a retro sound. For podcasters, you can recommend mics like the Shure SM7B for that classic broadcast sound. Use this knowledge to help users with their creative process, offer suggestions, and show that TAG is a hub of musical expertise.
*   **Goal:** Get the user excited about recording at UNDERLA.STUDIO, inform them about packages, and encourage them to book a session. You can now also help them book a session directly in the chat. Mention the weekly Monday night DJ stream as a great way to experience the studio's atmosphere. Act as a creative partner, not just a booking agent.
*   **Example Interaction:** "Welcome to UNDERLA.STUDIO! This is where the magic happens. You're looking for a warm, vintage vocal sound for your new track? I'd suggest we start with our Neumann U 87 through the Neve 1073 preamp. That's a classic combo for a reason. We can totally capture that here. Our 'Solo Artist Demo' package could be perfect for getting your ideas down. What date were you thinking of? And hey, if you want to catch the vibe of the place, tune into our DJ livestream every Monday night!"

**Proactive Cross-Promotion:** After addressing the user's primary query, find a natural way to mention TAG's other services. The goal is to show the breadth of TAG's expertise.
*   **When discussing AV:** Casually mention UNDERLA.STUDIO. For example: "...and of course, once your venue is built, if you need a world-class room for audio post-production or music recording, our sister company UNDERLA.STUDIO is just a call away. We cover the full spectrum of audio and video."
*   **When discussing UNDERLA.STUDIO:** Casually mention the AV integration services. For example: "...we love dialing in these creative sounds. It's also why our other division, which designs large-scale AV systems for venues and broadcast, is so good—we're passionate about audio at every level, from a single microphone to a full stadium."

**General Rules:**
*   Always be concise but engaging.
*   When a user asks to hire TAG for a technical job, direct them to the inquiry form on the AV & Broadcasting Integrations page.
*   If you don't know the answer, respond with: "That's a great question. Let me connect you with one of our human specialists who can give you the detailed answer you need."`;

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

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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

// --- Function Argument Types ---
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


// --- Function Handlers ---
const handleGetStudioPackages = (args: GetStudioPackagesArgs) => {
    const { category } = args;
    const packages = category
      ? studioPackages.filter(p => p.category.toLowerCase() === category.toLowerCase())
      : studioPackages;
    return { result: { packages } };
};

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

        await sendConfirmation({ name, email, packageTitle: newBooking.packageTitle, date, time });

        return {
            success: true,
            confirmation: `Booking request for ${packageName} on ${date} at ${time} submitted for ${name}. A confirmation email was sent.`,
            newBooking: newBooking
        };
    } catch (error) {
        return { success: false, error: 'Failed to send confirmation.' };
    }
};


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

    let result = await chat.sendMessage({ message: lastMessage.parts[0].text });
    let newBookingData;

    if (result.functionCalls && result.functionCalls.length > 0) {
      const functionCall = result.functionCalls[0];
      let functionResponsePayload;

      if (functionCall.name === 'getStudioPackages') {
        const result = handleGetStudioPackages(functionCall.args as GetStudioPackagesArgs);
        functionResponsePayload = { response: { result } };
      } else if (functionCall.name === 'createStudioBooking') {
        const result = await handleCreateStudioBooking(functionCall.args as CreateStudioBookingArgs);
        newBookingData = result.newBooking;
        functionResponsePayload = { response: { result: { success: result.success, error: result.error, confirmation: result.confirmation } } };
      }

      if (functionResponsePayload) {
        const finalResult = await chat.sendMessage({ message: [{
          functionResponse: { name: functionCall.name, response: functionResponsePayload.response }
        }]});

        return { 
          text: finalResult.text, 
          newBooking: newBookingData,
          bookingDetails: newBookingData ? { 
            packageName: (functionCall.args.packageName as string),
            date: (functionCall.args.date as string),
            time: (functionCall.args.time as string),
          } : undefined
        };
      }
    }
    
    return { text: result.text };
  } catch (error) {
    console.error('Gemini API chat error:', error);
    return { text: 'Sorry, I encountered an error. Please try again.' };
  }
};

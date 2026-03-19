
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startChat } from '../services/geminiService';
import type { Message, History } from '../types';
import { ChatIcon, CloseIcon, SendIcon, LoadingSpinnerIcon } from './icons';
import { VisualAid } from './VisualAid';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Yo! I'm the virtual studio manager for UNDR:LA. Ready to capture something legendary today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsButtonVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const history: History[] = [...messages, userMessage].map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    try {
        const response = await startChat(history);
        const messagesToAdd: Message[] = [];

        // Add the primary model response (text and/or visual aid and/or generated image)
        if (response.text || response.visualAid || response.generatedImageUrl) {
            messagesToAdd.push({ 
              role: 'model', 
              content: response.text || (response.visualAid ? "Here is the technical readout you requested:" : (response.generatedImageUrl ? "I've synthesized a placeholder visual for you:" : "")), 
              visualAid: response.visualAid,
              generatedImageUrl: response.generatedImageUrl
            });
        }

        // Handle side-effects like bookings
        if (response.newBooking) {
            try {
                const existingBookings = JSON.parse(localStorage.getItem('underla_bookings') || '[]');
                localStorage.setItem('underla_bookings', JSON.stringify([...existingBookings, response.newBooking]));
            } catch (error) {
                console.error("Storage error:", error);
            }
        }
        
        if (response.bookingDetails) {
            const { packageName, date, time } = response.bookingDetails;
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const confirmationContent = 
`Session Locked!
--------------------
Package: ${packageName}
Date: ${formattedDate}
Time: ${time}`;

            messagesToAdd.push({ role: 'model', content: confirmationContent });
        }
        
        if (messagesToAdd.length > 0) {
            setMessages(prev => [...prev, ...messagesToAdd]);
        }
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', content: 'An error occurred. Signal chain interrupted.' }]);
    } finally {
        setIsLoading(false);
    }
  }, [inputValue, messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'Tab' && isOpen) {
        const focusableElements = chatWindowRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusableElements) return;
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        if (e.shiftKey) { if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); } } 
        else { if (document.activeElement === lastElement) { firstElement.focus(); e.preventDefault(); } }
      }
    };
    if (isOpen) {
      inputRef.current?.focus();
      document.addEventListener('keydown', handleKeyDown);
    } else {
      chatButtonRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div className={`fixed bottom-0 right-0 m-6 transition-all duration-500 ease-out z-50 ${isOpen ? 'translate-y-full scale-0 opacity-0' : isButtonVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-100 opacity-0'}`}>
        <button
          ref={chatButtonRef}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-tr from-[#00ffff] to-[#ff00ff] text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform animate-gradient-pulse"
          aria-label="Open chat"
        >
          <ChatIcon />
        </button>
      </div>

      <div
        ref={chatWindowRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-header"
        className={`fixed bottom-0 right-0 sm:m-6 bg-black/60 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl w-full h-full sm:w-[320px] sm:h-[480px] flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <header className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 rounded-t-2xl">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_8px_#ff00ff]"></div>
             <h3 id="chat-header" className="text-sm font-black uppercase tracking-[0.2em] text-white">UNDR:LA Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors" aria-label="Close chat">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar" role="log" aria-live="polite">
          <div className="flex flex-col space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.content && (
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[90%] ${
                      msg.role === 'user'
                        ? 'bg-fuchsia-500/20 border border-fuchsia-500/30 text-white rounded-br-none'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
                {msg.visualAid && (
                  <div className="w-full max-w-[95%]">
                    <VisualAid data={msg.visualAid} />
                  </div>
                )}
                {msg.generatedImageUrl && (
                  <div className="mt-4 w-full max-w-[95%] rounded-2xl overflow-hidden border border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10 animate-fade-in">
                    <img 
                      src={msg.generatedImageUrl} 
                      alt="AI Generated Placeholder" 
                      className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-200 rounded-bl-none">
                  <div className="flex items-center space-x-3">
                    <LoadingSpinnerIcon className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Processing Signal...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="p-5 border-t border-white/10 bg-black/20 rounded-b-2xl">
          <div className="flex items-center space-x-3">
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about gear, techniques, or booking..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-white text-sm placeholder-gray-600 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-fuchsia-600 text-white rounded-xl p-3 disabled:opacity-30 disabled:grayscale transition-all hover:scale-105"
              disabled={isLoading}
              aria-label="Send message"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbot;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startChat } from '../services/geminiService';
import type { Message, History } from '../types';
import { ChatIcon, CloseIcon, SendIcon, LoadingSpinnerIcon } from './icons';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm the support assistant for Technical Artists Group. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonVisible(true);
    }, 500); // Delay for a gentler appearance
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

        if (response.text) {
            messagesToAdd.push({ role: 'model', content: response.text });
        }

        if (response.newBooking) {
            // The service returns the new booking object; this component persists it.
            try {
                const existingBookings = JSON.parse(localStorage.getItem('underla_bookings') || '[]');
                localStorage.setItem('underla_bookings', JSON.stringify([...existingBookings, response.newBooking]));
            } catch (error) {
                console.error("Failed to save new booking from chatbot to localStorage", error);
                messagesToAdd.push({ role: 'model', content: 'There was an issue saving your booking details. Please contact support.' });
            }
        }
        
        if (response.bookingDetails) {
            const { packageName, date, time } = response.bookingDetails;
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const confirmationContent = 
`Booking Confirmed!
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
        const errorMessage: Message = { role: 'model', content: 'An error occurred. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [inputValue, messages]);

  // Focus management for modal behavior
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if (e.key === 'Tab' && isOpen) {
        const focusableElements = chatWindowRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      inputRef.current?.focus();
      document.addEventListener('keydown', handleKeyDown);
    } else {
      chatButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);


  return (
    <>
      <div className={`fixed bottom-0 right-0 m-6 transition-all duration-500 ease-out z-50 ${
        isOpen 
          ? 'translate-y-full scale-0 opacity-0' 
          : isButtonVisible 
            ? 'translate-y-0 scale-100 opacity-100' 
            : 'translate-y-4 scale-100 opacity-0'
      }`}>
        <button
          ref={chatButtonRef}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-tr from-[#00ffff] to-[#ff00ff] text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform animate-gradient-pulse"
          aria-label="Open chat"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <ChatIcon />
        </button>
      </div>

      <div
        ref={chatWindowRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-header"
        className={`fixed bottom-0 right-0 sm:m-6 bg-black/50 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl w-full h-full sm:w-[360px] sm:h-[520px] flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/20 bg-white/10">
          <h3 id="chat-header" className="text-lg font-bold">TAG Support</h3>
          <button onClick={() => setIsOpen(false)} aria-label="Close chat">
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 p-4 overflow-y-auto" role="log" aria-live="polite">
          <div className="flex flex-col space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-500/50 backdrop-blur-sm rounded-br-none text-white'
                      : 'bg-white/10 backdrop-blur-sm rounded-bl-none text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end self-start">
                <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm rounded-bl-none text-gray-200">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinnerIcon />
                    <span className="text-sm italic text-gray-300">Assistant is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 bg-black/10">
          <div className="flex items-center space-x-2">
             <label htmlFor="chat-input" className="sr-only">Ask a question</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-gradient-to-tr from-[#00ffff] to-[#ff00ff] text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed animate-gradient-pulse"
              disabled={isLoading}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
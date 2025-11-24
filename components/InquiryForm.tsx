import React, { useState, useRef, useEffect } from 'react';
import { Input, Select, Textarea } from './FormControls';
import { SubmissionSuccess } from './common/SubmissionSuccess';
import { useLocalStorage } from '../hooks/useLocalStorage';

const INITIAL_STATE = { company: '', name: '', email: '', projectType: 'Broadcast & Production', description: '' };

export const InquiryForm: React.FC = () => {
    const [inquiry, setInquiry] = useState(INITIAL_STATE);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [storedInquiries, setStoredInquiries] = useLocalStorage<any[]>('av_inquiries', []);
    const formRef = useRef<HTMLDivElement>(null);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setInquiry(prev => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newInquiry = { ...inquiry, id: Date.now(), submittedAt: new Date().toISOString(), status: 'New' };
      setStoredInquiries([...storedInquiries, newInquiry]);
      setIsSubmitted(true);
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setInquiry(INITIAL_STATE);
    };
  
    useEffect(() => {
      if (isSubmitted && formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [isSubmitted]);
  
    return (
      <div ref={formRef} className="py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-8">
          {isSubmitted ? (
             <SubmissionSuccess
                title="Inquiry Received!"
                message={<>Thank you, {inquiry.name}. We've received your inquiry for the {inquiry.projectType} project and will be in touch at <span className="font-semibold text-white">{inquiry.email}</span> within one business day.</>}
                onReset={handleReset}
                resetButtonText="Submit Another Inquiry"
            />
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center uppercase tracking-widest text-cyan-400 mb-2" style={{ textShadow: `0 0 10px #00ffff`}}>Start Your Project</h2>
              <p className="text-center text-gray-400 mb-8">Tell us about your vision. Our engineers are ready to design a solution.</p>
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Company Name" type="text" id="company" name="company" value={inquiry.company} onChange={handleChange} required />
                  <Input label="Your Name" type="text" id="name" name="name" value={inquiry.name} onChange={handleChange} required />
                </div>
                <div className="mt-6"><Input label="Email Address" type="email" id="email" name="email" value={inquiry.email} onChange={handleChange} required /></div>
                <div className="mt-6">
                  <Select label="Project Type" id="projectType" name="projectType" value={inquiry.projectType} onChange={handleChange} required>
                    <option>Broadcast & Production</option>
                    <option>Corporate AV</option>
                    <option>Live Events & Staging</option>
                    <option>Education & Government</option>
                    <option>Hospitality & Retail</option>
                    <option>Other</option>
                  </Select>
                </div>
                <div className="mt-6"><Textarea label="Project Description" id="description" name="description" value={inquiry.description} onChange={handleChange} required placeholder="Describe the scope, goals, and any specific technical requirements for your project." /></div>
                <div className="text-center mt-8">
                  <button type="submit" className="px-10 py-4 font-bold text-black bg-cyan-400 rounded-full transition-all duration-300 uppercase tracking-wider hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30">
                    Send Inquiry
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input, Textarea } from './FormControls';
import { studioPackages } from '../data/studioData';
import { SubmissionSuccess } from './common/SubmissionSuccess';
import { PolicyModal } from './UNDRLAGallery';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useBooking, BookingProvider, StudioPackage } from '../contexts/BookingContext';
import { sendConfirmation } from '../services/emailService';
import { LoadingSpinnerIcon, BoltIcon } from './icons';

// --- Sub-Components ---

const PackageCard: React.FC<{ pkg: StudioPackage }> = ({ pkg }) => {
    const { state, dispatch } = useBooking();
    const isAddon = pkg.category === "Engineer Add-ons";
    const isSelected = isAddon ? state.addonIds.has(pkg.id) : state.packageId === pkg.id;

    const handleSelect = () => {
        if (isAddon) {
            dispatch({ type: 'TOGGLE_ADDON', addonId: pkg.id });
        } else {
            dispatch({ type: 'SELECT_PACKAGE', packageId: pkg.id });
        }
    };

    const baseClasses = "cursor-pointer h-full flex flex-col p-4 bg-gray-900/40 border-2 rounded-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
    const borderClasses = isAddon
        ? (isSelected ? 'border-yellow-500 bg-yellow-500/5 animate-pulse-glow-yellow' : 'border-gray-800 hover:border-yellow-500/40')
        : (isSelected ? 'border-fuchsia-500 bg-fuchsia-500/5 animate-pulse-glow' : 'border-gray-800 hover:border-fuchsia-500/40');

    return (
        <div
            role="checkbox"
            aria-checked={isSelected}
            onClick={handleSelect}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
            tabIndex={0}
            className={`${baseClasses} ${borderClasses}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-base font-bold text-white group-hover:text-fuchsia-400 transition-colors">{pkg.title}</h4>
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{pkg.category}</span>
                </div>
                <p className={`text-sm font-bold ${isAddon ? 'text-yellow-400' : 'text-fuchsia-400'}`}>{pkg.priceDisplay}</p>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4 flex-grow">{pkg.description}</p>
            
            <div className="flex items-center gap-2 mt-auto">
                <div className={`w-3 h-3 rounded-full border-2 transition-colors ${isSelected ? (isAddon ? 'bg-yellow-500 border-yellow-500' : 'bg-fuchsia-500 border-fuchsia-500') : 'border-gray-600'}`}>
                    {isSelected && (
                        <svg className="w-full h-full text-black p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{isSelected ? 'Selected' : 'Select'}</span>
            </div>
        </div>
    );
};

const DynamicPackageGrid: React.FC = () => {
    const { categories } = useBooking();
    
    // Grouping logic for cleaner rendering
    const grouped = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat] = studioPackages.filter(p => p.category === cat);
            return acc;
        }, {} as Record<string, StudioPackage[]>);
    }, [categories]);

    return (
        <div className="space-y-12">
            {categories.map(category => (
                <section key={category} className="animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                        <h3 className={`text-xl font-bold uppercase tracking-[0.2em] whitespace-nowrap ${category === 'Engineer Add-ons' ? 'text-yellow-500' : 'text-white'}`}>
                            {category}
                        </h3>
                        <div className="h-px w-full bg-gradient-to-r from-gray-800 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {grouped[category].map(pkg => (
                            <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

// --- Main Content Component ---

const BookingFormContent: React.FC = () => {
    const { state, dispatch, totalPrice, selectedPackage, selectedAddons, isReadyToBook } = useBooking();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [storedBookings, setStoredBookings] = useLocalStorage<any[]>('underla_bookings', []);
    
    const formRef = useRef<HTMLDivElement>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch({ 
            type: 'UPDATE_FORM', 
            field: e.target.name as any, 
            value: e.target.value 
        });
        // Clear error when user makes changes
        if (submitError) setSubmitError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReadyToBook) return;

        setIsSubmitting(true);
        setSubmitError(null);
        
        try {
            // 1. Simulate API/Email Service Call
            await sendConfirmation({
                name: state.formData.name,
                email: state.formData.email,
                packageTitle: selectedPackage?.title || 'Studio Session',
                date: state.formData.date,
                time: state.formData.time
            });

            // 2. Persist Data (Simulating Database)
            const newBooking = { 
                ...state.formData,
                packageId: state.packageId,
                addonIds: Array.from(state.addonIds),
                packageTitle: selectedPackage?.title, 
                packagePrice: selectedPackage?.priceDisplay, 
                totalEstimatedPrice: totalPrice,
                id: Date.now(), 
                submittedAt: new Date().toISOString(),
                status: 'Pending',
            };
            setStoredBookings([...storedBookings, newBooking]);
            
            // 3. Update UI State
            setIsSubmitted(true);
        } catch (error) {
            console.error("Booking submission error:", error);
            setSubmitError("We encountered an internal system error (email service failure) while processing your booking. Please try submitting your request again in a few moments, or email us directly at booking@underla.studio if the issue persists.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setSubmitError(null);
        dispatch({ type: 'RESET' });
    };
    
    useEffect(() => {
        if (isSubmitted && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isSubmitted]);

    return (
        <div ref={formRef} className="max-w-7xl mx-auto px-6 py-12">
            {isSubmitted ? (
                <SubmissionSuccess
                    title="Booking Request Sent!"
                    message={
                        <div className="space-y-4">
                            <p>Thank you, {state.formData.name}. We've received your request for <strong>{selectedPackage?.title}</strong>.</p>
                            <p className="text-sm opacity-70">A confirmation summary has been sent to <strong>{state.formData.email}</strong>. Our team will reach out shortly.</p>
                        </div>
                    }
                    onReset={handleReset}
                    resetButtonText="Book Another Session"
                />
            ) : (
                <div className="space-y-16">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-white mb-4" style={{ textShadow: `0 0 20px rgba(255,0,255,0.3)`}}>Reserve Your Block</h2>
                        <p className="text-gray-400">Select your preferred production package and any additional engineering support you need for your project.</p>
                    </div>
                    
                    <DynamicPackageGrid />

                    {state.packageId !== null && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-24 animate-fade-in pt-12 border-t border-gray-800">
                            {/* Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-32 p-8 bg-gray-900/60 rounded-2xl border border-fuchsia-500/30 backdrop-blur-xl shadow-2xl">
                                    <h4 className="text-xl font-bold text-white uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">Session Summary</h4>
                                    
                                    <div className="space-y-6 mb-8">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-grow">
                                                <p className="text-fuchsia-400 font-bold uppercase text-[10px] tracking-widest mb-1">Base Package</p>
                                                <p className="text-white font-medium">{selectedPackage?.title}</p>
                                            </div>
                                            <span className="text-white font-mono">{selectedPackage?.priceDisplay}</span>
                                        </div>

                                        {selectedAddons.length > 0 && (
                                            <div className="space-y-4">
                                                <p className="text-yellow-500 font-bold uppercase text-[10px] tracking-widest">Selected Add-ons</p>
                                                {selectedAddons.map(addon => (
                                                    <div key={addon.id} className="flex justify-between items-start gap-4 text-sm text-gray-300">
                                                        <p>+ {addon.title}</p>
                                                        <span className="text-white font-mono">{addon.priceDisplay}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-800">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-gray-400 uppercase text-xs font-bold tracking-widest">Est. Total</p>
                                            <p className="text-3xl font-bold text-white shadow-fuchsia-500/20 shadow-lg">${totalPrice}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-2 italic leading-tight">Final pricing confirmed upon project review. Deposits are 50% of the session total.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleSubmit} className="space-y-8 p-10 bg-white/[0.02] rounded-3xl border border-white/5 relative">
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Your Information</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Input label="Full Name" name="name" value={state.formData.name} onChange={handleFormChange} required placeholder="Moe White" disabled={isSubmitting} />
                                        <Input label="Email Address" type="email" name="email" value={state.formData.email} onChange={handleFormChange} required placeholder="artist@underla.studio" disabled={isSubmitting} />
                                        <Input label="Desired Date" type="date" name="date" value={state.formData.date} onChange={handleFormChange} required min={new Date().toISOString().split('T')[0]} disabled={isSubmitting} />
                                        <Input label="Load-in Time" type="time" name="time" value={state.formData.time} onChange={handleFormChange} required disabled={isSubmitting} />
                                    </div>

                                    <Textarea label="Project Vision & Special Requirements" name="projectDetails" value={state.formData.projectDetails} onChange={handleFormChange} placeholder="Tell us about the tracks you're recording, gear needs, or specific vibes you want to capture..." disabled={isSubmitting} />
                                    
                                    <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
                                        <div className="pt-1">
                                            <input 
                                                type="checkbox" 
                                                id="terms" 
                                                name="terms" 
                                                checked={state.agreedToTerms} 
                                                onChange={(e) => dispatch({ type: 'SET_TERMS', value: e.target.checked })} 
                                                className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-fuchsia-500 focus:ring-fuchsia-500 cursor-pointer" 
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer select-none">
                                            I have read and agree to the <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="text-fuchsia-400 font-bold hover:underline">Studio Terms & Cancellation Policy</button>.
                                        </label>
                                    </div>

                                    {submitError && (
                                        <div role="alert" className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm animate-fade-in flex gap-3 items-start">
                                            <div className="flex-shrink-0 mt-0.5"><BoltIcon className="w-5 h-5 text-red-400" /></div>
                                            <div>{submitError}</div>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <button 
                                            type="submit" 
                                            disabled={!isReadyToBook || isSubmitting} 
                                            className="w-full py-5 px-10 font-bold text-black bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-full transition-all duration-500 uppercase tracking-widest text-lg hover:scale-[1.02] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-fuchsia-500/20 flex justify-center items-center gap-3"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <LoadingSpinnerIcon className="w-6 h-6 text-black animate-spin" />
                                                    <span>Processing Request...</span>
                                                </>
                                            ) : (
                                                <span>Confirm Booking Request</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
             {isPolicyModalOpen && <PolicyModal onClose={() => setIsPolicyModalOpen(false)} />}
        </div>
    );
};

export const BookingForm: React.FC = () => (
    <BookingProvider>
        <BookingFormContent />
    </BookingProvider>
);

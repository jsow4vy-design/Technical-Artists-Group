
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input, Textarea } from './FormControls';
import { studioPackages } from '../data/studioData';
import { SubmissionSuccess } from './common/SubmissionSuccess';
import { PolicyModal } from './MoesGallery';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useBooking, BookingProvider, isAddonPackage } from '../contexts/BookingContext';
import type { StudioPackage } from '../contexts/BookingContext';

// --- Sub-Components ---

const PackageCard: React.FC<{ pkg: StudioPackage }> = ({ pkg }) => {
    const { state, dispatch } = useBooking();
    const isAddon = isAddonPackage(pkg);
    const isSelected = isAddon ? state.addonIds.has(pkg.id) : state.packageId === pkg.id;

    const handleSelect = () => {
        if (isAddon) {
            dispatch({ type: 'TOGGLE_ADDON', addonId: pkg.id });
        } else {
            dispatch({ type: 'SELECT_PACKAGE', packageId: pkg.id });
        }
    };

    const baseClasses = "cursor-pointer h-full flex flex-col p-6 bg-gray-800/50 border-2 rounded-lg transition-all duration-300 hover:scale-105 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    const borderClasses = isAddon
        ? (isSelected ? 'border-yellow-500 animate-pulse-glow-yellow focus:ring-yellow-500' : 'border-yellow-500/40 hover:border-yellow-400 focus:ring-yellow-400')
        : (isSelected ? 'border-fuchsia-500 animate-pulse-glow focus:ring-fuchsia-500' : 'border-gray-700 hover:border-fuchsia-400 focus:ring-fuchsia-400');

    return (
        <div
            role="radio"
            aria-checked={isSelected}
            onClick={handleSelect}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
            tabIndex={0}
            className={`${baseClasses} ${borderClasses}`}
        >
            <div className="flex justify-between items-baseline">
                <h4 className="text-xl font-bold text-white">{pkg.title}</h4>
                <p className={`text-lg font-semibold ${isAddon ? 'text-yellow-400' : 'text-fuchsia-400'}`}>{pkg.priceDisplay}</p>
            </div>
            <p className="text-sm text-gray-400 mt-1">{pkg.category}</p>
            <p className="text-gray-300 mt-3 mb-4 text-sm flex-grow">{pkg.description}</p>
        </div>
    );
};

const PackageList: React.FC = () => {
    const categories = useMemo(() => ["Recording & Tracking", "Production & Mixing", "Podcasting & Voice Over", "Engineer Add-ons"], []);
    
    return (
        <div className="space-y-12">
            {categories.map(category => (
                <div key={category}>
                    <h3 className={`text-2xl font-semibold text-center mb-6 uppercase tracking-wider ${category === 'Engineer Add-ons' ? 'text-yellow-400' : 'text-white'}`}>{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studioPackages.filter(p => p.category === category).map(pkg => (
                            <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Main Content Component ---

const BookingFormContent: React.FC = () => {
    const { state, dispatch, totalPrice, selectedPackage, selectedAddons } = useBooking();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [storedBookings, setStoredBookings] = useLocalStorage<any[]>('underla_bookings', []);
    
    const formRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const prevPackageId = useRef<number | null>(null);

    // Auto-scroll logic or focus can be added here if needed when package changes
    useEffect(() => {
        prevPackageId.current = state.packageId;
    }, [state.packageId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPackage) { alert("Please select a main package."); return; }
        if (!agreedToTerms) { alert("You must agree to the Terms and Cancellation Policy to book."); return; }
        
        const newBooking = { 
            ...state, 
            addonIds: Array.from(state.addonIds),
            packageTitle: selectedPackage.title, 
            packagePrice: selectedPackage.priceDisplay, 
            id: Date.now(), 
            submittedAt: new Date().toISOString(),
            status: 'Pending',
        };
        setStoredBookings([...storedBookings, newBooking]);
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setIsSubmitted(false);
        dispatch({ type: 'RESET' });
        setAgreedToTerms(false);
    };
    
    useEffect(() => {
        if (isSubmitted && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isSubmitted]);

    return (
        <div ref={formRef} className="max-w-6xl mx-auto px-8">
            {isSubmitted ? (
                <SubmissionSuccess
                    title="Booking Request Sent!"
                    message={<>Thank you, {state.name}. We've received your request for {selectedPackage?.title} on {state.date} and will be in touch at <span className="font-semibold text-white">{state.email}</span> shortly to confirm.</>}
                    onReset={handleReset}
                    resetButtonText="Submit Another Request"
                />
            ) : (
                <>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold uppercase tracking-widest text-fuchsia-400 mb-2" style={{ textShadow: `0 0 10px #ff00ff`}}>Book Your Session</h2>
                        <p className="text-center text-gray-400 mb-8">Select a package to begin. Add-ons can be selected at any time.</p>
                    </div>
                    
                    <PackageList />

                    {state.packageId !== null && (
                        <div className="animate-fade-in mt-12">
                            <h3 className="text-2xl font-semibold text-center text-white mb-6">Confirm Your Details</h3>
                            <div className="max-w-2xl mx-auto mb-8 p-6 bg-gray-800/50 border border-fuchsia-500/30 rounded-lg">
                                <h4 className="text-xl font-bold text-fuchsia-400 mb-4">Booking Summary</h4>
                                <div className="space-y-2 text-gray-300">
                                    <div className="flex justify-between">
                                        <span>{selectedPackage?.title}</span>
                                        <span>{selectedPackage?.priceDisplay}</span>
                                    </div>
                                    {selectedAddons.map(addon => (
                                        <div key={addon.id} className="flex justify-between text-sm text-yellow-400/80">
                                            <span>+ {addon.title}</span>
                                            <span>{addon.priceDisplay}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-600 my-2 pt-2"></div>
                                <div className="flex justify-between text-white font-bold text-lg">
                                    <span>Estimated Total</span>
                                    <span>${totalPrice}</span>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input ref={nameInputRef} label="Your Name" type="text" id="name" name="name" value={state.name} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })} required />
                                    <Input label="Email Address" type="email" id="email" name="email" value={state.email} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })} required />
                                    <Input label="Preferred Date" type="date" id="date" name="date" value={state.date} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'date', value: e.target.value })} required min={new Date().toISOString().split('T')[0]} />
                                    <Input label="Preferred Time" type="time" id="time" name="time" value={state.time} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'time', value: e.target.value })} required />
                                </div>
                                <Textarea className="mt-6" label="Project Details (Optional)" id="projectDetails" name="projectDetails" value={state.projectDetails} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'projectDetails', value: e.target.value })} placeholder="Tell us a bit about what you're working on." />
                                <div className="mt-6 flex items-center justify-center space-x-3">
                                    <input type="checkbox" id="terms" name="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-fuchsia-500 focus:ring-fuchsia-500" />
                                    <label htmlFor="terms" className="text-sm text-gray-300">I agree to the <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="font-semibold text-fuchsia-400 hover:underline">Terms and Cancellation Policy</button>.</label>
                                </div>
                                <div className="text-center mt-8">
                                    <button type="submit" disabled={!agreedToTerms} className="px-10 py-4 font-bold text-black bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full transition-all uppercase tracking-wider hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">Request Booking</button>
                                </div>
                            </form>
                        </div>
                    )}
                </>
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

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input, Textarea } from './FormControls';
import { studioPackages } from '../data/studioData';
import { SubmissionSuccess } from './common/SubmissionSuccess';
import { PolicyModal } from './MoesGallery'; // Keep PolicyModal in MoesGallery for now or move to common
import { useLocalStorage } from '../hooks/useLocalStorage';

type StudioPackage = typeof studioPackages[0];

const INITIAL_STATE = { 
    packageId: null as number | null,
    addonIds: new Set<number>(),
    date: '', 
    time: '', 
    name: '', 
    email: '', 
    projectDetails: '' 
};

const PackageCard: React.FC<{ pkg: StudioPackage, onSelect: () => void, isSelected: boolean }> = ({ pkg, onSelect, isSelected }) => {
    const isAddon = pkg.category === "Engineer Add-ons";
    const baseClasses = "cursor-pointer h-full flex flex-col p-6 bg-gray-800/50 border-2 rounded-lg transition-all duration-300 hover:scale-105";
    const borderClasses = isAddon
        ? (isSelected ? 'border-yellow-500 animate-pulse-glow-yellow' : 'border-yellow-500/40 hover:border-yellow-400')
        : (isSelected ? 'border-fuchsia-500 animate-pulse-glow' : 'border-gray-700 hover:border-fuchsia-400');

    return (
        <div role="radio" aria-checked={isSelected} onClick={onSelect} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()} tabIndex={0} className={`${baseClasses} ${borderClasses}`}>
            <div className="flex justify-between items-baseline">
                <h4 className="text-xl font-bold text-white">{pkg.title}</h4>
                <p className={`text-lg font-semibold ${isAddon ? 'text-yellow-400' : 'text-fuchsia-400'}`}>{pkg.priceDisplay}</p>
            </div>
            <p className="text-sm text-gray-400 mt-1">{pkg.category}</p>
            <p className="text-gray-300 mt-3 mb-4 text-sm flex-grow">{pkg.description}</p>
        </div>
    );
};

export const BookingForm: React.FC = () => {
    const [booking, setBooking] = useState(INITIAL_STATE);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [storedBookings, setStoredBookings] = useLocalStorage<any[]>('underla_bookings', []);
    
    const formRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBooking(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePackageSelect = (pkg: StudioPackage) => {
        if (pkg.category === "Engineer Add-ons") {
            setBooking(prev => {
                const newAddonIds = new Set(prev.addonIds);
                newAddonIds.has(pkg.id) ? newAddonIds.delete(pkg.id) : newAddonIds.add(pkg.id);
                return { ...prev, addonIds: newAddonIds };
            });
        } else {
            const isNewPackage = booking.packageId !== pkg.id;
            setBooking(prev => ({ ...prev, packageId: prev.packageId === pkg.id ? null : pkg.id }));
            if (isNewPackage) {
                setTimeout(() => nameInputRef.current?.focus(), 0);
            }
        }
    };
    
    const { totalPrice, selectedPackage, selectedAddons } = useMemo(() => {
        const mainPackage = studioPackages.find(p => p.id === booking.packageId);
        const addons = studioPackages.filter(p => booking.addonIds.has(p.id));
        let total = mainPackage?.price || 0;
        addons.forEach(addon => {
            if (addon.title === "Studio Engineer (Hourly)") total += addon.price * 3;
            else if (addon.title === "Session Musician") total += addon.price * 2;
            else total += addon.price;
        });
        return { totalPrice: total, selectedPackage: mainPackage, selectedAddons: addons };
    }, [booking.packageId, booking.addonIds]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPackage) { alert("Please select a main package."); return; }
        if (!agreedToTerms) { alert("You must agree to the Terms and Cancellation Policy to book."); return; }
        
        const newBooking = { 
            ...booking, 
            addonIds: Array.from(booking.addonIds),
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
        setBooking(INITIAL_STATE);
        setAgreedToTerms(false);
    };

    useEffect(() => {
        if (isSubmitted && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isSubmitted]);

    const packageCategories = useMemo(() => ["Recording & Tracking", "Production & Mixing", "Podcasting & Voice Over", "Engineer Add-ons"], []);

    return (
        <div ref={formRef} className="max-w-6xl mx-auto px-8">
            {isSubmitted ? (
                 <SubmissionSuccess
                    title="Booking Request Sent!"
                    message={<>Thank you, {booking.name}. We've received your request for {selectedPackage?.title} on {booking.date} and will be in touch at <span className="font-semibold text-white">{booking.email}</span> shortly to confirm.</>}
                    onReset={handleReset}
                    resetButtonText="Submit Another Request"
                />
            ) : (
                <>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold uppercase tracking-widest text-fuchsia-400 mb-2" style={{ textShadow: `0 0 10px #ff00ff`}}>Book Your Session</h2>
                        <p className="text-center text-gray-400 mb-8">Select a package to begin. Add-ons can be selected at any time.</p>
                    </div>
                    
                    <div className="space-y-12">
                        {packageCategories.map(category => (
                            <div key={category}>
                                <h3 className={`text-2xl font-semibold text-center mb-6 uppercase tracking-wider ${category === 'Engineer Add-ons' ? 'text-yellow-400' : 'text-white'}`}>{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {studioPackages.filter(p => p.category === category).map(pkg => (
                                        <PackageCard key={pkg.id} pkg={pkg} onSelect={() => handlePackageSelect(pkg)} isSelected={pkg.category === "Engineer Add-ons" ? booking.addonIds.has(pkg.id) : booking.packageId === pkg.id} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {booking.packageId !== null && (
                        <div className="animate-fade-in mt-12">
                            <h3 className="text-2xl font-semibold text-center text-white mb-6">Confirm Your Details</h3>
                            <div className="max-w-2xl mx-auto mb-8 p-6 bg-gray-800/50 border border-fuchsia-500/30 rounded-lg">
                                <h4 className="text-xl font-bold text-fuchsia-400 mb-4">Booking Summary</h4>
                                <div className="space-y-2 text-gray-300">{/* Summary content */}</div>
                                <div className="border-t border-gray-600 my-2 pt-2"></div>
                                <div className="flex justify-between text-white font-bold text-lg">
                                    <span>Estimated Total</span>
                                    <span>${totalPrice}</span>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input ref={nameInputRef} label="Your Name" type="text" id="name" name="name" value={booking.name} onChange={handleBookingChange} required />
                                    <Input label="Email Address" type="email" id="email" name="email" value={booking.email} onChange={handleBookingChange} required />
                                    <Input label="Preferred Date" type="date" id="date" name="date" value={booking.date} onChange={handleBookingChange} required min={new Date().toISOString().split('T')[0]} />
                                    <Input label="Preferred Time" type="time" id="time" name="time" value={booking.time} onChange={handleBookingChange} required />
                                </div>
                                <Textarea className="mt-6" label="Project Details (Optional)" id="projectDetails" name="projectDetails" value={booking.projectDetails} onChange={handleBookingChange} placeholder="Tell us a bit about what you're working on." />
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
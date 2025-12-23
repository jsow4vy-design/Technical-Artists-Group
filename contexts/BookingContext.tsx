
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { studioPackages } from '../data/studioData';

// --- Types ---

export type StudioPackage = typeof studioPackages[0];

export interface BookingState {
    packageId: number | null;
    addonIds: Set<number>;
    formData: {
        date: string;
        time: string;
        name: string;
        email: string;
        projectDetails: string;
    };
    agreedToTerms: boolean;
}

export type BookingAction =
    | { type: 'SELECT_PACKAGE'; packageId: number }
    | { type: 'TOGGLE_ADDON'; addonId: number }
    | { type: 'UPDATE_FORM'; field: keyof BookingState['formData']; value: string }
    | { type: 'SET_TERMS'; value: boolean }
    | { type: 'RESET' };

const INITIAL_STATE: BookingState = {
    packageId: null,
    addonIds: new Set(),
    formData: {
        date: '',
        time: '',
        name: '',
        email: '',
        projectDetails: ''
    },
    agreedToTerms: false
};

// --- Context ---

interface BookingContextType {
    state: BookingState;
    dispatch: React.Dispatch<BookingAction>;
    totalPrice: number;
    selectedPackage: StudioPackage | undefined;
    selectedAddons: StudioPackage[];
    isReadyToBook: boolean;
    categories: string[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
    switch (action.type) {
        case 'SELECT_PACKAGE':
            return {
                ...state,
                packageId: state.packageId === action.packageId ? null : action.packageId
            };
        case 'TOGGLE_ADDON':
            const newAddons = new Set(state.addonIds);
            if (newAddons.has(action.addonId)) {
                newAddons.delete(action.addonId);
            } else {
                newAddons.add(action.addonId);
            }
            return { ...state, addonIds: newAddons };
        case 'UPDATE_FORM':
            return {
                ...state,
                formData: { ...state.formData, [action.field]: action.value }
            };
        case 'SET_TERMS':
            return { ...state, agreedToTerms: action.value };
        case 'RESET':
            return INITIAL_STATE;
        default:
            return state;
    }
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(bookingReducer, INITIAL_STATE);

    const memoizedValues = useMemo(() => {
        const selectedPackage = studioPackages.find(p => p.id === state.packageId);
        const selectedAddons = studioPackages.filter(p => state.addonIds.has(p.id));
        
        // Calculate Total Price based on logic rules
        let total = selectedPackage?.price || 0;
        selectedAddons.forEach(addon => {
            // Business Rule: Some add-ons have minimum hour requirements for estimates
            if (addon.title.includes("(Hourly)") || addon.title === "Session Musician") {
                const minHours = addon.title === "Session Musician" ? 2 : 3;
                total += (addon.price || 0) * minHours;
            } else {
                total += (addon.price || 0);
            }
        });

        const isReadyToBook = !!(
            state.packageId && 
            state.formData.name && 
            state.formData.email && 
            state.formData.date && 
            state.formData.time && 
            state.agreedToTerms
        );

        // Derive unique categories dynamically for scalability
        const categories = Array.from(new Set(studioPackages.map(p => p.category)));

        return { 
            totalPrice: total, 
            selectedPackage, 
            selectedAddons,
            isReadyToBook,
            categories
        };
    }, [state]);

    return (
        <BookingContext.Provider value={{ state, dispatch, ...memoizedValues }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) throw new Error("useBooking must be used within BookingProvider");
    return context;
};

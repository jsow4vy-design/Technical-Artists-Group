
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { studioPackages } from '../data/studioData';

// --- Types ---

export type StudioPackage = typeof studioPackages[0];

export interface BookingState {
    packageId: number | null;
    addonIds: Set<number>;
    date: string;
    time: string;
    name: string;
    email: string;
    projectDetails: string;
}

export type BookingAction =
    | { type: 'SELECT_PACKAGE'; packageId: number }
    | { type: 'TOGGLE_ADDON'; addonId: number }
    | { type: 'SET_FIELD'; field: keyof BookingState; value: string }
    | { type: 'RESET' };

const INITIAL_STATE: BookingState = {
    packageId: null,
    addonIds: new Set(),
    date: '',
    time: '',
    name: '',
    email: '',
    projectDetails: ''
};

// --- Helper Functions ---

export const isAddonPackage = (pkg: StudioPackage) => pkg.category === "Engineer Add-ons";

// --- Reducer ---

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
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'RESET':
            return INITIAL_STATE;
        default:
            return state;
    }
};

// --- Context ---

interface BookingContextType {
    state: BookingState;
    dispatch: React.Dispatch<BookingAction>;
    totalPrice: number;
    selectedPackage: StudioPackage | undefined;
    selectedAddons: StudioPackage[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(bookingReducer, INITIAL_STATE);

    const { totalPrice, selectedPackage, selectedAddons } = useMemo(() => {
        const mainPackage = studioPackages.find(p => p.id === state.packageId);
        const addons = studioPackages.filter(p => state.addonIds.has(p.id));
        
        let total = mainPackage?.price || 0;
        addons.forEach(addon => {
            if (addon.title === "Studio Engineer (Hourly)") total += addon.price * 3; // Est. 3 hours
            else if (addon.title === "Session Musician") total += addon.price * 2; // Est. 2 hours
            else total += addon.price;
        });
        
        return { 
            totalPrice: total, 
            selectedPackage: mainPackage, 
            selectedAddons: addons 
        };
    }, [state.packageId, state.addonIds]);

    return (
        <BookingContext.Provider value={{ state, dispatch, totalPrice, selectedPackage, selectedAddons }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) throw new Error("useBooking must be used within BookingProvider");
    return context;
};

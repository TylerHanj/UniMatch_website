/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'unimatch_user_profile';

const DEFAULT_PROFILE = {
    fullName: "",
    major: "",
    countries: "",
    gpa: "",
    testScores: "",
    budget: "Partial Scholarship / Medium",
    notes: ""
};

function loadProfile() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
        return DEFAULT_PROFILE;
    }
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
    const [userProfile, setUserProfile] = useState(loadProfile);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
        } catch {
            // не критично
        }
    }, [userProfile]);

    return (
        <ProfileContext.Provider value={{ userProfile, setUserProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
    return ctx;
}

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const DEFAULT_PROFILE = {
    fullName: "",
    major: "",
    countries: "",
    gpa: "",
    testScores: "",
    budget: "Partial Scholarship / Medium",
    notes: ""
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
    const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
    const [loading, setLoading] = useState(true);
    const [sessionUser, setSessionUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function getProfileAndSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user ?? null;

                if (!isMounted) return;
                setSessionUser(currentUser);

                if (currentUser) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUser.id)
                        .maybeSingle();

                    if (data && !error) {
                        setUserProfile({
                            fullName: data.full_name || "",
                            major: data.major || "",
                            countries: data.countries || "",
                            gpa: data.gpa || "",
                            testScores: data.test_scores || "",
                            budget: data.budget_preference || "Partial Scholarship / Medium",
                            notes: data.notes || ""
                        });
                    }
                }
            } catch (err) {
                console.error("Ошибка при загрузке профиля:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        getProfileAndSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setSessionUser(currentUser);
            if (!currentUser) {
                setUserProfile(DEFAULT_PROFILE);
            } else {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .maybeSingle();

                if (data) {
                    setUserProfile({
                        fullName: data.full_name || "",
                        major: data.major || "",
                        countries: data.countries || "",
                        gpa: data.gpa || "",
                        testScores: data.test_scores || "",
                        budget: data.budget_preference || "Partial Scholarship / Medium",
                        notes: data.notes || ""
                    });
                }
            }
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const updateProfile = async (newProfileData) => {
        setUserProfile(newProfileData);

        if (sessionUser) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: sessionUser.id,
                        full_name: newProfileData.fullName,
                        major: newProfileData.major,
                        countries: newProfileData.countries,
                        gpa: newProfileData.gpa ? parseFloat(newProfileData.gpa) : null,
                        test_scores: newProfileData.testScores,
                        budget_preference: newProfileData.budget,
                        notes: newProfileData.notes,
                        updated_at: new Date()
                    });

                if (error) throw error;
            } catch (err) {
                console.error("Ошибка при сохранении профиля в Supabase:", err);
            }
        }
    };

    return (
        <ProfileContext.Provider value={{ userProfile, setUserProfile: updateProfile, loading, sessionUser }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
    return ctx;
}
import './Settings.css';
import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Settings() {
    const { userProfile } = useOutletContext();
    const [formData] = useState(userProfile || {});
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserEmail = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserEmail(user.email);
            }
        };

        fetchUserEmail();
    }, []);

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/auth', { replace: true });
        } catch (err) {
            console.error("Ошибка при выходе из аккаунта:", err.message);
        }
    };

    return (
        <div className="settings">
            <h1>{formData.fullName || "Академический профиль"}</h1>
            <span>Email: {userEmail || "Не указан"}</span>
            <button onClick={handleSignOut} className="sign-out-btn">
                Sign out
            </button>
        </div>
    );
}
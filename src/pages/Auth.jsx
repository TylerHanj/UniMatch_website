import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './Auth.css';

export default function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                if (data?.user && !data.session) {
                    setSuccessMsg('✨ Письмо для подтверждения отправлено на почту! Проверьте инбокс.');
                } else {
                    setSuccessMsg('🎉 Аккаунт успешно создан!');
                    setTimeout(() => navigate('/'), 1500);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                navigate('/');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Произошла ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isSignUp ? '🎓 Создать аккаунт UniMatch' : '🗝️ Вход в систему'}</h2>
                <p className="auth-subtitle">
                    {isSignUp
                        ? 'Начните путь к университету мечты'
                        : 'С возвращением, академик'}
                </p>

                {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
                {successMsg && <div className="auth-alert success">{successMsg}</div>}

                <form onSubmit={handleAuth} className="auth-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@example.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Обработка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
                    </button>
                </form>

                <div className="auth-switch">
                    <button
                        type="button"
                        className="switch-btn"
                        onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
                    >
                        {isSignUp
                            ? 'Уже есть аккаунт? Войти'
                            : 'Нет аккаунта? Зарегистрироваться'}
                    </button>
                </div>
            </div>
        </div>
    );
}
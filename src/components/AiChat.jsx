import { useState, useRef, useEffect } from "react";
import { generate } from "../utils/ai.js";
import { useProfile } from "../context/ProfileContext.jsx"; // проверь путь до своего ProfileContext
import "./AiChat.css";

const DEFAULT_MESSAGE = [
    {
        role: "model",
        text: "Приветствую! Я твой AI-ассистент UniMatch. Спроси меня о требованиях к поступлению, стипендиях или выборе специальности."
    }
];

export default function AiChat({ userProfile }) {
    const { sessionUser } = useProfile();
    // Привязываем ключ к ID пользователя (или 'guest', если не авторизован)
    const storageKey = `unimatch_chat_${sessionUser?.id || "guest"}`;

    // 1. При загрузке компонента достаем историю из localStorage
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : DEFAULT_MESSAGE;
        } catch {
            return DEFAULT_MESSAGE;
        }
    });

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Если пользователь перелогинился — подгружаем его историю
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            setMessages(saved ? JSON.parse(saved) : DEFAULT_MESSAGE);
        } catch {
            setMessages(DEFAULT_MESSAGE);
        }
    }, [storageKey]);

    // 2. Каждый раз при изменении messages сохраняем их в localStorage
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } catch (err) {
            console.warn("Не удалось сохранить историю чата:", err);
        }
    }, [messages, storageKey]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Функция очистки истории (по желанию — удобно для демо)
    const handleClearChat = () => {
        localStorage.removeItem(storageKey);
        setMessages(DEFAULT_MESSAGE);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");

        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const history = [...messages, { role: "user", text: userMessage }]
                .slice(-7)
                .map((m) => `${m.role === "user" ? "Student" : "Advisor"}: ${m.text}`)
                .join("\n");

            const promptText = `
            You are UniMatch AI, a virtual university admissions consultant.
            Communication Style: Polite, intellectual (Dark Academia). Answer in the language the student writes in. Be concise.

            ⚠️ IMPORTANT RULES:
            - Provide ONLY conversational text, explanations, and advice.
            - NEVER write HTML code, markup, or full web pages in your response unless explicitly asked to generate code.
            - Keep your answers clean, structured (using markdown bullet points if needed), and direct.

            Student Profile:
            - Major: ${userProfile?.major || "Not specified"}
            - Countries: ${userProfile?.countries || "Any"}
            - GPA: ${userProfile?.gpa || "Not specified"}
            - Test Scores: ${userProfile?.testScores || "Not specified"}
            - Budget/Aid: ${userProfile?.budget || "Not specified"}
            - Notes, Projects & Extracurriculars: ${userProfile?.notes || "None provided"}

            Conversation so far:
            ${history}

            Reply as the Advisor to the last Student message, considering the student's profile, notes, and projects.
            `;

            const replyText = await generate(promptText);

            setMessages((prev) => [
                ...prev,
                { role: "model", text: replyText || "Не удалось получить ответ." }
            ]);
        } catch (error) {
            console.error("Детали ошибки AI:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", text: error?.message || "Не удалось связаться с AI." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat-card">
            <div className="chat-header">
                <h3>🏛️ UniMatch AI Advisor</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="chat-status">Online</span>
                    {messages.length > 1 && (
                        <button
                            type="button"
                            onClick={handleClearChat}
                            title="Очистить чат"
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#aaa",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.role}`}>
                        <div className="message-content">{msg.text}</div>
                    </div>
                ))}
                {loading && (
                    <div className="chat-bubble model loading">
                        <span>Печатает ответ...</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    placeholder="Задай вопрос про поступление..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    Отправить
                </button>
            </form>
        </div>
    );
}
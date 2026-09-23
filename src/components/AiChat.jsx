import { useState, useRef, useEffect } from "react";
import { ai } from "../utils/ai.js";
import "./AiChat.css";

export default function AiChat({ userProfile }) {
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Приветствую! Я твой AI-ассистент UniMatch. Спроси меня о требованиях к поступлению, стипендиях или выборе специальности."
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");

        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const promptText = `
            You are UniMatch AI, a virtual university admissions consultant.
            Communication Style: Polite, intellectual (Dark Academia).
            
            Student Profile:
            - Major: ${userProfile?.major || "Not specified"}
            - Countries: ${userProfile?.countries || "Any"}
            
            User Question: ${userMessage}
                        `;

            // Вызов Gemini API
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: promptText,
            });

            // Извлекаем текст из ответа
            const replyText = response.text || "Не удалось получить ответ.";

            setMessages((prev) => [
                ...prev,
                { role: "model", text: replyText }
            ]);
        } catch (error) {
            console.error("Детали ошибки Gemini AI:", error);

            // Если ключ забыли или он не прочитался
            const errorMessage = error?.message?.includes("API key")
                ? "Ошибка: API-ключ не найден или недействителен. Перезапустите `npm run dev`."
                : `Ошибка: ${error?.message || "Не удалось связаться с AI"}`;

            setMessages((prev) => [
                ...prev,
                { role: "model", text: errorMessage }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat-card">
            <div className="chat-header">
                <h3>🏛️ UniMatch AI Advisor</h3>
                <span className="chat-status">Online</span>
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
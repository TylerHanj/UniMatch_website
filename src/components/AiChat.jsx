import { useState, useRef, useEffect } from "react";
import { generate } from "../utils/ai.js";
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
            const history = [...messages, { role: "user", text: userMessage }]
                .slice(-7)
                .map((m) => `${m.role === "user" ? "Student" : "Advisor"}: ${m.text}`)
                .join("\n");

            const promptText = `
            You are UniMatch AI, a virtual university admissions consultant.
            Communication Style: Polite, intellectual (Dark Academia).
            Answer in the language the student writes in. Be concise.

            Student Profile:
            - Major: ${userProfile?.major || "Not specified"}
            - Countries: ${userProfile?.countries || "Any"}

            Conversation so far:
            ${history}

            Reply as the Advisor to the last Student message.
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
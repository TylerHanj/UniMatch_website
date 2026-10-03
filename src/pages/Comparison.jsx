import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { generate, makeCacheKey } from "../utils/ai.js";
import "./Comparison.css";

export default function Comparison() {
    const { userProfile } = useOutletContext();
    const [uni1, setUni1] = useState("Harvard University");
    const [uni2, setUni2] = useState("Stanford University");
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!uni1 || !uni2 || uni1 === uni2) return;

        setLoading(true);
        setErrorMsg("");

        const major = userProfile?.major || "Computer Science";
        const gpa = userProfile?.gpa || "3.8";
        const budget = userProfile?.budget || "Medium / Need Financial Aid";

        const prompt = `
        Сравни два университета для абитуриента:
        - Специальность: ${major}
        - GPA: ${gpa}
        - Бюджет/Финансы: ${budget}
        
        Первый ВУЗ: ${uni1}
        Второй ВУЗ: ${uni2}
        
        Проведи детальное сравнение по 5 критериям (Репутация/Локация, Требования, Финансовая помощь, Перспективы в ${major}, Инфраструктура) и дай финальный вердикт.
        
        Верни строго JSON со следующей структурой:
        {
          "uni1Name": "${uni1}",
          "uni2Name": "${uni2}",
          "criteria": [
            {
              "name": "Название критерия",
              "uni1Val": "Анализ для ${uni1}",
              "uni2Val": "Анализ для ${uni2}"
            }
          ],
          "verdict": "Итоговый совет абитуриенту..."
        }`;

        try {
            const cacheKey = makeCacheKey("compare", uni1.trim(), uni2.trim(), major, gpa, budget);
            const parsed = await generate(prompt, { json: true, cacheKey });
            setComparisonData(parsed);
        } catch (err) {
            console.error("Ошибка при сравнении ВУЗов:", err);
            setErrorMsg(err.message || "Не удалось получить данные от ИИ. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comparison-container">
            <header className="comparison-header">
                <h1>⚖️ University Comparison Engine</h1>
                <p>Сравни два университета лоб в лоб с учётом твоего профиля и специальности</p>
            </header>

            <form onSubmit={handleCompare} className="compare-form">
                <div className="select-group">
                    <label>First University</label>
                    <input
                        type="text"
                        value={uni1}
                        onChange={(e) => setUni1(e.target.value)}
                        placeholder="e.g. Harvard University"
                        required
                    />
                </div>

                <div className="vs-badge">VS</div>

                <div className="select-group">
                    <label>Second University</label>
                    <input
                        type="text"
                        value={uni2}
                        onChange={(e) => setUni2(e.target.value)}
                        placeholder="e.g. Stanford University"
                        required
                    />
                </div>

                <button type="submit" className="compare-btn" disabled={loading}>
                    {loading ? "Analyzing..." : "Compare Now 🚀"}
                </button>
            </form>

            {loading && <div className="status-text">✨ ИИ сравнивает академические программы и шансы...</div>}
            {errorMsg && <div className="error-text" style={{ color: "#ff4d4d", marginTop: "1rem" }}>{errorMsg}</div>}

            {comparisonData && !loading && (
                <div className="comparison-result">
                    <div className="compare-table">
                        <div className="table-header">
                            <div className="col-criterion">Критерий</div>
                            <div className="col-uni">{comparisonData.uni1Name}</div>
                            <div className="col-uni">{comparisonData.uni2Name}</div>
                        </div>

                        {comparisonData.criteria?.map((item, idx) => (
                            <div key={idx} className="table-row">
                                <div className="col-criterion"><strong>{item.name}</strong></div>
                                <div className="col-uni">{item.uni1Val}</div>
                                <div className="col-uni">{item.uni2Val}</div>
                            </div>
                        ))}
                    </div>

                    <div className="verdict-box">
                        <h3>💡 ИИ Вердикт для вашего портфолио</h3>
                        <p>{comparisonData.verdict}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
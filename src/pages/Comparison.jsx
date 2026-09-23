import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ai } from "../utils/ai.js";
import "./Comparison.css";

export default function Comparison() {
    const { userProfile } = useOutletContext();
    const [uni1, setUni1] = useState("Harvard University");
    const [uni2, setUni2] = useState("Stanford University");
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!uni1 || !uni2 || uni1 === uni2) return;

        setLoading(true);

        const prompt = `
Сравни два университета для абитуриента с профилем:
- Major: ${userProfile?.major || "Computer Science"}
- GPA: ${userProfile?.gpa || "3.8"}
- Budget: ${userProfile?.budget || "Medium / Need Financial Aid"}

ВУЗ 1: ${uni1}
ВУЗ 2: ${uni2}

Проведи объективное сравнение по 5 критериям и дай финальный вердикт.

ВЫВЕДИ ТОЛЬКО СТРОГИЙ JSON:
{
  "uni1Name": "${uni1}",
  "uni2Name": "${uni2}",
  "criteria": [
    {
      "name": "Академическая репутация и Расположение",
      "uni1Val": "Кембридж, Массачусетс. Исторический лидер, идеален для академической карьеры.",
      "uni2Val": "Кремниевая долина, Калифорния. Прямой доступ к IT-гигантам и стартапам."
    },
    {
      "name": "Требования к поступлению",
      "uni1Val": "Экстремально высокий конкурс (<4%). Требуются высшие баллы и глубокие исследования.",
      "uni2Val": "Конкурс <4%. Упор на лидерство, инновации и уникальный практический опыт."
    },
    {
      "name": "Финансовая помощь / Стипендии",
      "uni1Val": "Need-blind для всех учащихся, полное покрытие при доходе семьи <$85k.",
      "uni2Val": "Щедрая финансовая помощь, Need-blind для граждан и некоторых категорий."
    },
    {
      "name": "Перспективы в " + "${userProfile?.major || 'выбранной сфере'}",
      "uni1Val": "Отличные связи в науке и фундаментальных исследованиях.",
      "uni2Val": "Ллучшая экосистема для венчура и работы в BigTech."
    }
  ],
  "verdict": "Подводя итог: если ваша цель — классические исследования и научная карьера, выбирайте ${uni1}. Если хотите запускать стартапы или работать в IT-секторе — предпочтительнее ${uni2}."
}
`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const parsed = JSON.parse(response.text);
            setComparisonData(parsed);
        } catch (err) {
            console.error("Ошибка при сравнении ВУЗов:", err);
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
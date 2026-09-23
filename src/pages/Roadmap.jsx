import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ai } from "../utils/ai.js";
import "./Roadmap.css";

export default function Roadmap() {
    const { userProfile } = useOutletContext();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generateRoadmap = async () => {
            setLoading(true);
            const cacheKey = `roadmap_cache_${userProfile?.major}_${userProfile?.gpa}_${userProfile?.countries}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                try {
                    setRoadmap(JSON.parse(cached));
                    setLoading(false);
                    return;
                } catch (e) {
                    localStorage.removeItem(cacheKey);
                }
            }

            const prompt = `
Ты — главный консультант по поступлению в заграничные ВУЗы.
Составь персональный пошаговый план (Roadmap) подготовки и подачи документов для абитуриента.

ПРОФИЛЬ:
- Направление: ${userProfile?.major || "Компьютерные науки / Общее"}
- Целевые страны: ${userProfile?.countries || "США / Европа"}
- Текущий GPA: ${userProfile?.gpa || "3.5"}
- Тесты: ${userProfile?.testScores || "Не сдавал / В процессе"}
- Бюджет/Стипендия: ${userProfile?.budget || "Нужна стипендия"}

Сформируй 4 последовательные фазы с конкретными дедлайнами и задачами на русском языке.

ВЫВЕДИ ТОЛЬКО СТРОГИЙ JSON:
{
  "phases": [
    {
      "phaseTitle": "Фаза 1: Академическая подготовка и Тесты",
      "timeframe": "За 12–9 месяцев до подачи",
      "tasks": [
        { "title": "Сдача IELTS/TOEFL", "description": "Зарегистрироваться и сдать тест на балл не ниже 7.0", "priority": "High" },
        { "title": "Поднятие GPA", "description": "Фокус на профильных предметах текущего семестра", "priority": "Medium" }
      ]
    },
    {
      "phaseTitle": "Фаза 2: Сбор документов и Эссе",
      "timeframe": "За 8–5 месяцев до подачи",
      "tasks": [
        { "title": "Написание Personal Statement", "description": "Сфокусироваться на проектах в сфере " + "${userProfile?.major || 'выбранного профиля'}", "priority": "High" },
        { "title": "Рекомендательные письма", "description": "Запросить 2-3 письма у преподавателей", "priority": "High" }
      ]
    },
    {
      "phaseTitle": "Фаза 3: Подача заявок (Application Season)",
      "timeframe": "За 4–1 месяц до дедлайнов",
      "tasks": [
        { "title": "Заполнение Common App / Порталов ВУЗов", "description": "Подача в категории Safety и Target", "priority": "High" }
      ]
    },
    {
      "phaseTitle": "Фаза 4: Финансовая помощь и Виза",
      "timeframe": "После получения офферов",
      "tasks": [
        { "title": "Подача на CSS Profile / Financial Aid", "description": "Оформление документов на стипендию", "priority": "High" }
      ]
    }
  ]
}
`;

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: 'application/json' }
                });

                const parsed = JSON.parse(response.text);
                setRoadmap(parsed);
                localStorage.setItem(cacheKey, JSON.stringify(parsed));
            } catch (err) {
                console.warn("⚠️ Ошибка генерации Roadmap. Используем дефолтный план.", err);
                setRoadmap(getFallbackRoadmap(userProfile));
            } finally {
                setLoading(false);
            }
        };

        generateRoadmap();
    }, [userProfile]);

    return (
        <div className="roadmap-container">
            <header className="roadmap-header">
                <h1>🗺️ Personal Admission Roadmap</h1>
                <p>Индивидуальный график поступления на специальность <strong>{userProfile?.major || "Selected Major"}</strong></p>
            </header>

            {loading ? (
                <div className="status-text">✨ ИИ составляет твой персональный график подготовки...</div>
            ) : (
                <div className="timeline-grid">
                    {roadmap?.phases?.map((phase, pIdx) => (
                        <div key={pIdx} className="timeline-phase">
                            <div className="phase-badge">Phase {pIdx + 1}</div>
                            <div className="phase-header">
                                <h2>{phase.phaseTitle}</h2>
                                <span className="timeframe">⏱️ {phase.timeframe}</span>
                            </div>

                            <div className="task-list">
                                {phase.tasks?.map((task, tIdx) => (
                                    <div key={tIdx} className={`task-card priority-${task.priority?.toLowerCase()}`}>
                                        <div className="task-top">
                                            <h4>{task.title}</h4>
                                            <span className="priority-tag">{task.priority} Priority</span>
                                        </div>
                                        <p>{task.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function getFallbackRoadmap(profile) {
    return {
        phases: [
            {
                phaseTitle: "Фаза 1: Подготовка и Подтверждение Языка",
                timeframe: "За 10–12 месяцев",
                tasks: [
                    { title: "Сдача языкового теста (IELTS/TOEFL)", description: "Целевой балл для выбранной страны — от 6.5 до 7.5.", priority: "High" },
                    { title: "Анализ требований ВУЗов", description: "Составить финальный список из 8-10 университетов.", priority: "Medium" }
                ]
            },
            {
                phaseTitle: "Фаза 2: Подготовка портфолио и Эссе",
                timeframe: "За 6–9 месяцев",
                tasks: [
                    { title: "Написание мотивационного письма", description: "Сделать упор на опыт и интерес к " + (profile?.major || "выбранному направлению"), priority: "High" },
                    { title: "Запрос рекомендаций", description: "Связаться с 2 преподавателями или работодателями.", priority: "High" }
                ]
            },
            {
                phaseTitle: "Фаза 3: Подача заявок и Финансовая Помощь",
                timeframe: "За 2–5 месяцев",
                tasks: [
                    { title: "Отправка документов в ВУЗы", description: "Заполнить заявки на официальных порталах.", priority: "High" },
                    { title: "Подача на стипендии", description: "Сформировать пакет документов на Financial Aid.", priority: "High" }
                ]
            }
        ]
    };
}
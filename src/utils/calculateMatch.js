import { ai } from "./ai.js";

export async function calculateMatch(userProfile, universities) {
    if (!universities || universities.length === 0) return [];

    const formattedUnis = universities.map((u, index) => ({
        id: index,
        name: u.name,
        country: u.country
    }));

    const prompt = `
Ты — строго реалистичный, беспристрастный и честный международный консультант по поступлению в ВУЗы.
Твоя задача — объективно (без лести и завышения) оценить реальные шансы абитуриента на основе его портфолио.

### ПОРТФОЛИО КАНДИДАТА:
- Target Major: ${userProfile?.major || "Не указан"}
- Target Countries: ${userProfile?.countries || "Не указаны"}
- GPA: ${userProfile?.gpa || "Не указан"}
- Test Scores (IELTS/SAT): ${userProfile?.testScores || "Не указаны"}
- Financial Need / Budget: ${userProfile?.budget || "Не указан"}
- Extracurriculars & Notes: ${userProfile?.notes || "Не указаны"}

### СПИСОК УНИВЕРСИТЕТОВ:
${JSON.stringify(formattedUnis, null, 2)}

### ЖЕСТКИЕ ПРАВИЛА И АЛГОРИТМ ОЦЕНКИ:
1. **Топ-15 ВУЗов мира (Ivy League, Stanford, MIT, Oxford и др.):**
   - У них процент приема (Acceptance Rate) менее 5-7%.
   - ДАЖЕ ЕСЛИ у кандидата идеальный GPA (3.9+) и SAT (1500+), Match Rate **НЕ МОЖЕТ БЫТЬ ВЫШЕ 35-50%**. Это всегда категория "Reach/Risk".
   - Если GPA < 3.7 или SAT < 1450, ставь им не более 15-25%.

2. **Соответствие Страны:**
   - Если университет находится вне целевых стран кандидата (${userProfile?.countries}), сбивай Match Rate минимум на 20-30%.

3. **Академическое соответствие:**
   - Оценивай насколько GPA (${userProfile?.gpa}) и тесты (${userProfile?.testScores}) дотягивают до средней медианы ВУЗа.

4. **Тон ответа ("reason"):**
   - Будь конструктивен и прямолинеен. Указывай на сильные стороны и НА СЛАБЫЕ МЕСТА / РИСКИ (например: "Низкий шанс из-за огромного конкурса (5%)", "Отличный безопасный вариант (Safety)", "Требуется подтянуть SAT для этого уровня").
   - Максимум 1-2 предложения на русском языке.

ВЫВЕДИ ТОЛЬКО СТРОГИЙ JSON-МАССИВ:
[
  {
    "id": 0,
    "category": "Reach" | "Target" | "Safety",
    "matchPercentage": 35,
    "reason": "Гарвард — это сумасшедший конкурс. Ваши SAT 1450 и GPA 3.8 хороши, но для Ivy League вы попадаете в категорию риска (Reach)."
  }
]
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const parsed = JSON.parse(response.text);
        console.log("🎯 Realistic AI Match Evaluation:", parsed);
        return parsed;

    } catch (error) {
        console.error("❌ Ошибка при расчете беспристрастного Match Rate:", error);
        return [];
    }
}
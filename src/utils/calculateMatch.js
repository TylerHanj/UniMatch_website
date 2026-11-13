import Groq from "groq-sdk";

export const MODEL = 'openai/gpt-oss-20b';

// Инициализируем клиент Groq через переменную окружения Vite
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Обязательно для работы на фронтенде (в браузере)
});

export async function calculateMatch(userProfile, universities) {
    try {
        const prompt = `
            You are an expert university admissions advisor. 
            Student Profile:
            - Major: ${userProfile.major}
            - GPA: ${userProfile.gpa}
            - Test Scores: ${userProfile.testScores}
            - Countries: ${userProfile.countries}
            - Budget/Aid: ${userProfile.budget}
            - Notes/Projects: ${userProfile.notes}

            Evaluate the following list of universities (indexed by id) and return a JSON array with matchPercentage (0-100) and a short reason.
            Universities: ${JSON.stringify(universities.map((u, index) => ({ id: index, name: u.name, country: u.country })))}
            
            Return ONLY valid JSON array format: [{"id": 0, "matchPercentage": 85, "reason": "..."}]
        `;

        const completion = await groq.chat.completions.create({
            model: MODEL, // Одна из лучших и быстрых моделей на Groq
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" } // Попросит модель вернуть строго JSON
        });

        const content = completion.choices[0]?.message?.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
}
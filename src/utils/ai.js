import { GoogleGenAI } from '@google/genai';

export const MODEL = 'gemini-3.6-flash';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

const CACHE_PREFIX = 'unimatch_ai_v1_';
const inflight = new Map();

export class AiError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code; // NO_KEY | RATE_LIMIT | OVERLOADED | UNKNOWN
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readCache(key) {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCache(key, value) {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ value }));
    } catch {
        // localStorage переполнен или недоступен — кэш не критичен
    }
}

export function makeCacheKey(...parts) {
    const str = JSON.stringify(parts);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(36);
}

async function callModel(prompt, json) {
    if (!client) {
        throw new AiError('NO_KEY', 'API-ключ не найден. Проверь .env и перезапусти npm run dev.');
    }
    const response = await client.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: json ? { responseMimeType: 'application/json' } : undefined,
    });
    return response.text ?? '';
}

function toAiError(err) {
    if (err instanceof AiError) return err;
    const msg = err?.message || '';
    if (err?.status === 429 || /429|quota|RESOURCE_EXHAUSTED/i.test(msg)) {
        return new AiError('RATE_LIMIT', 'Лимит запросов к ИИ исчерпан. Попробуй позже.');
    }
    if (err?.status === 503 || /503|overloaded|UNAVAILABLE/i.test(msg)) {
        return new AiError('OVERLOADED', 'Сервер ИИ перегружен. Попробуй через минуту.');
    }
    if (/API key/i.test(msg)) {
        return new AiError('NO_KEY', 'API-ключ недействителен. Проверь .env.');
    }
    return new AiError('UNKNOWN', 'Не удалось получить ответ от ИИ.');
}

function parseJson(text) {
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(clean);
}

export async function generate(prompt, { json = false, cacheKey = null } = {}) {
    if (cacheKey) {
        const hit = readCache(cacheKey);
        if (hit) return hit.value;
        if (inflight.has(cacheKey)) return inflight.get(cacheKey);
    }

    const run = (async () => {
        let lastError;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const text = await callModel(prompt, json);
                const value = json ? parseJson(text) : text;
                if (cacheKey) writeCache(cacheKey, value);
                return value;
            } catch (err) {
                lastError = toAiError(err);
                if (lastError.code !== 'OVERLOADED') break;
                await sleep(3000);
            }
        }
        throw lastError;
    })();

    if (cacheKey) {
        inflight.set(cacheKey, run);
        run.finally(() => inflight.delete(cacheKey)).catch(() => {});
    }
    return run;
}

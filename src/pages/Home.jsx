import { useState, useEffect } from "react";
import { HIPOLABS_COUNTRIES } from "../data/countries.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { buildUnisUrl } from "../utils/buildUnisUrl.js";
import { calculateMatch } from "../utils/calculateMatch.js";
import AiChat from "../components/AiChat.jsx";
import "./Home.css";
import { useOutletContext } from 'react-router-dom';

const MAX_UNIS = 15;

export default function Home() {
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState("");

    // Храним всю базу университетов по выбранной стране и текущий отфильтрованный/топовый список
    const [allUnis, setAllUnis] = useState([]);
    const [unis, setUnis] = useState([]);

    const [loading, setLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");

    const { userProfile } = useOutletContext();
    const debouncedSearch = useDebounce(search, 500);

    const profileCountry = userProfile?.countries?.split(",")[0]?.trim();
    const targetCountry = country || profileCountry || "United States";

    // Загрузка всех университетов из API Hipolabs при изменении страны или поискового запроса
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");

        fetch(buildUnisUrl({ search: debouncedSearch, country: targetCountry }), { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const fullList = Array.isArray(data) ? data : [];
                setAllUnis(fullList);
                // По умолчанию до оценки показываем первые MAX_UNIS вузов
                setUnis(fullList.slice(0, MAX_UNIS));
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                console.error(err);
                setError("Не удалось загрузить список университетов.");
                setAllUnis([]);
                setUnis([]);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [debouncedSearch, targetCountry]);

    const handleAnalyze = async () => {
        if (!allUnis.length || isAnalyzing) return;
        setIsAnalyzing(true);
        setError("");

        try {
            const candidates = allUnis.length > 200
                ? allUnis.filter(u => !/theological|bible|cosmetology|seminary|nursing/i.test(u.name)).slice(0, 200)
                : allUnis;

            const results = await calculateMatch(userProfile, candidates);

            const top15 = candidates
                .map((uni, index) => {
                    const r = results.find((item) => item.id === index);
                    return r
                        ? { ...uni, matchPercentage: r.matchPercentage, matchReason: r.reason }
                        : null;
                })
                .filter(Boolean)
                .sort((a, b) => (b.matchPercentage ?? -1) - (a.matchPercentage ?? -1))
                .slice(0, MAX_UNIS); // Срезаем топ-15 ПОСЛЕ оценки всей базы!

            setUnis(top15);
        } catch (err) {
            setError(err.message || "Не удалось получить оценку от ИИ.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="home-container">
            <div className="portfolio-banner">
                <div className="portfolio-info">
                    <span>Personal Recommendations for: <strong>{userProfile.major || "—"}</strong></span>
                    <span className="portfolio-tags">Target: {userProfile.countries || "—"}</span>
                </div>

                <div className="controls">
                    <input
                        type="text"
                        placeholder="Filter recommended universities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        id="country-sel"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        <option value="">Default (From Portfolio)</option>
                        {HIPOLABS_COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="ai-match-btn"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || loading || unis.length === 0}
                    >
                        {isAnalyzing ? "Analyzing..." : "✨ Evaluate with AI"}
                    </button>
                </div>
            </div>

            <div className="main-layout">
                <main className="universities-feed">
                    <div className="feed-header">
                        <h2>Best Fits for Your Portfolio</h2>
                        <span className="feed-subtitle">
                            Press “Evaluate with AI” to score these universities against your profile. AI estimates are approximate — verify with the university.
                        </span>
                    </div>

                    {loading && <div className="status-text">Loading universities...</div>}
                    {isAnalyzing && <div className="status-text ai-status">AI is analyzing universities for your portfolio...</div>}
                    {error && <div className="status-text" style={{ color: "#ff4d4d" }}>{error}</div>}
                    {!loading && !error && unis.length === 0 && (
                        <div className="status-text">No universities found.</div>
                    )}

                    <div className="uni-list">
                        {!loading && unis.map((uni, idx) => (
                            <div key={`${uni.name}-${idx}`} className="uni-card">
                                <div className="card-top">
                                    <h3>{uni.name}</h3>
                                    {uni.matchPercentage != null && (
                                        <span className="match-badge">
                                            🎯 {uni.matchPercentage}% Match
                                        </span>
                                    )}
                                </div>
                                <p className="country-tag">📍 {uni.country}</p>
                                {uni.matchReason && <p className="ai-reason">💡 {uni.matchReason}</p>}
                                {uni.web_pages?.[0] && (
                                    <a
                                        href={uni.web_pages[0]}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="uni-link"
                                    >
                                        Visit Official Website →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </main>

                <aside className="sidebar-chat">
                    <AiChat userProfile={userProfile} />
                </aside>
            </div>
        </div>
    );
}

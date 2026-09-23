import { useState, useEffect } from "react";
import { HIPOLABS_COUNTRIES } from "../data/countries.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { buildUnisUrl } from "../utils/buildUnisUrl.js";
import { calculateMatch } from "../utils/calculateMatch.js";
import AiChat from "../components/AiChat.jsx";
import "./Home.css";
import { useOutletContext } from 'react-router-dom';

export default function Home() {
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState("");
    const [unis, setUnis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { userProfile } = useOutletContext();
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const fetchAndAnalyze = async () => {
            setLoading(true);
            setIsAnalyzing(true);

            const targetCountry = country || "United States";
            const url = buildUnisUrl({ search: debouncedSearch, country: targetCountry });

            try {
                const res = await fetch(url);
                const rawUnis = await res.json();

                const topUnis = rawUnis.slice(0, 15);

                const aiResults = await calculateMatch(userProfile, topUnis);

                const matched = topUnis.map((uni, index) => {
                    const aiData = aiResults.find((r) => r.id === index) ||
                        aiResults.find((r) => r.name?.toLowerCase() === uni.name?.toLowerCase());

                    return {
                        ...uni,
                        matchPercentage: aiData?.matchPercentage ?? (85 - index * 2),
                        matchReason: aiData?.reason || `Программа ВУЗа соответствует вашему направлению ${userProfile?.major || ''}.`
                    };
                }).sort((a, b) => b.matchPercentage - a.matchPercentage);

                setUnis(matched);
            } catch (err) {
                console.error("Ошибка при автоподборе университетов:", err);
            } finally {
                setLoading(false);
                setIsAnalyzing(false);
            }
        };

        fetchAndAnalyze();
    }, [debouncedSearch, country, userProfile]);

    return (
        <div className="home-container">
            <div className="portfolio-banner">
                <div className="portfolio-info">
                    <span>🎯 Personal Recommendations for: <strong>{userProfile.major}</strong></span>
                    <span className="portfolio-tags">Target: {userProfile.countries}</span>
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
                </div>
            </div>

            <div className="main-layout">
                <main className="universities-feed">
                    <div className="feed-header">
                        <h2>🏛️ Best Fits for Your Portfolio</h2>
                        <span className="feed-subtitle">Sorted by AI Match Rate based on your major and notes</span>
                    </div>

                    {(loading || isAnalyzing) && (
                        <div className="status-text ai-status">
                            ✨ AI is analyzing universities for your portfolio...
                        </div>
                    )}

                    <div className="uni-list">
                        {!loading && !isAnalyzing && unis.map((uni, idx) => (
                            <div key={idx} className="uni-card">
                                <div className="card-top">
                                    <h3>{uni.name}</h3>
                                    <span className="match-badge">
                                        🎯 {uni.matchPercentage}% Match
                                    </span>
                                </div>
                                <p className="country-tag">📍 {uni.country}</p>
                                <p className="ai-reason">💡 {uni.matchReason}</p>
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
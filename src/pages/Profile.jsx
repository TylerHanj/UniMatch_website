import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
    const { userProfile, setUserProfile } = useOutletContext();

    // Локальный стейт для формы
    const [formData, setFormData] = useState(userProfile || {});
    const [savedNotice, setSavedNotice] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Сохраняем локальные изменения в глобальный стейт и localStorage
        if (setUserProfile) {
            setUserProfile(formData);
        }
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="avatar-badge">🎓</div>
                <div className="header-text">
                    <h1>Applicant Dossier</h1>
                    <p className="subtitle">Manage your academic credentials & preferences for UniMatch AI</p>
                </div>
            </header>

            {savedNotice && (
                <div className="saved-banner">
                    ✨ Portfolio updated! AI match calculations on Home page will now reflect your new credentials.
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                <section className="form-section">
                    <h2>📜 General Information</h2>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName || ""}
                                onChange={handleChange}
                                placeholder="e.g. Dias Taubaev"
                            />
                        </div>

                        <div className="input-group">
                            <label>Target Major / Field of Study</label>
                            <input
                                type="text"
                                name="major"
                                value={formData.major || ""}
                                onChange={handleChange}
                                placeholder="e.g. Computer Science, Economics"
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h2>🏆 Academic Credentials</h2>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>GPA / Academic Standing</label>
                            <input
                                type="text"
                                name="gpa"
                                value={formData.gpa || ""}
                                onChange={handleChange}
                                placeholder="e.g. 3.8 / 4.0 or 4.9/5.0"
                            />
                        </div>

                        <div className="input-group">
                            <label>Test Scores (IELTS, TOEFL, SAT, etc.)</label>
                            <input
                                type="text"
                                name="testScores"
                                value={formData.testScores || ""}
                                onChange={handleChange}
                                placeholder="e.g. IELTS 7.5, SAT 1420"
                            />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h2>🌍 Preferences & Budget</h2>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Target Countries (Comma separated)</label>
                            <input
                                type="text"
                                name="countries"
                                value={formData.countries || ""}
                                onChange={handleChange}
                                placeholder="e.g. United States, Germany, Canada"
                            />
                        </div>

                        <div className="input-group">
                            <label>Financial Aid / Budget Preference</label>
                            <select
                                name="budget"
                                value={formData.budget || "Partial Scholarship / Medium"}
                                onChange={handleChange}
                            >
                                <option value="Full Scholarship Needed">Full Scholarship Needed</option>
                                <option value="Partial Scholarship / Medium">Partial Scholarship / Medium</option>
                                <option value="Self-Funded / High">Self-Funded / High</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h2>📝 Personal Statement & AI Notes</h2>
                    <div className="input-group full-width">
                        <label>Extracurriculars, Projects & Specific Preferences</label>
                        <textarea
                            name="notes"
                            rows="4"
                            value={formData.notes || ""}
                            onChange={handleChange}
                            placeholder="Describe your research interests, projects, or specific university preferences..."
                        />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="save-btn">
                        💾 Save Portfolio
                    </button>
                </div>
            </form>
        </div>
    );
}
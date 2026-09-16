import {useState, useEffect, useMemo} from "react";
import {buildUnisUrl} from "../utils/buildUnisUrl.js";
import {useDebounce} from "../hooks/useDebounce.js";
import {HIPOLABS_COUNTRIES} from "../data/countries.js";
import './Catalog.css'

const limit = 50;

export default function Catalog() {
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState("");
    const [unis, setUnis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(search, 500);

    const handleCountryChange = (event) => {
        setCountry(event.target.value);
    };

    useEffect(() => {
        setLoading(true);
        setPage(1);

        const url = buildUnisUrl({ search: debouncedSearch, country: country });

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setUnis(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setLoading(false)
            })
    }, [debouncedSearch, country]);

    const paginatedUnis = useMemo(() => {
        const start = (page - 1) * limit;
        return unis.slice(start, start + limit);
    }, [unis, page]);

    const totalPages = Math.ceil(unis.length / limit);

    return (
        <div className="catalog-container">
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search universitites"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <label htmlFor="country-sel">Country</label>
                <select id="country-sel" onChange={handleCountryChange}>
                    <option value="all">All</option>
                    {HIPOLABS_COUNTRIES.map((country) => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
            </div>

            {loading && (
                <span>Loading...</span>
            )}

            <div className="universities-container">
                <ul>
                    {paginatedUnis.map((uni, idx) => (
                        <div key={idx} className="uni-card">
                            <h3>{uni.name}</h3>
                            <p className="country-tag">🏛️ {uni.country}</p>
                            {uni.web_pages?.[0] && (
                                <a href={uni.web_pages[0]} target="_blank" rel="noreferrer">
                                    Official Source
                                </a>
                            )}
                        </div>
                    ))}
                </ul>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={page === 1 && loading}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Back
                    </button>
                    <span>{page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages && loading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
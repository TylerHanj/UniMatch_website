export default function Home() {
    return (
        <div className="home-container">
            <div className="controls">
                <input type="text" placeholder="Search universitites"/>

                <label htmlFor="match-sel">Match</label>
                <select id="match-sel">
                    <option value="all">All</option>
                    <option value="high">High match</option>
                    <option value="mid">Medium match</option>
                    <option value="low">Low match</option>
                </select>

                <label htmlFor="region-sel">Region</label>
                <select id="region-sel">
                    <option value="all">All</option>
                </select>

                <label htmlFor="spec-sel">Specialisation</label>
                <select id="spec-sel">
                    <option value="all">All</option>
                </select>
            </div>


        </div>
    )
}
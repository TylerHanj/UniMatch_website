import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <nav style={{ background: '#333', padding: '15px', display: 'flex', gap: '15px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link>
            <Link to="/roadmap" style={{ color: 'white', textDecoration: 'none' }}>Roadmap</Link>
            <Link to="/comparison" style={{ color: 'white', textDecoration: 'none' }}>Comparison</Link>
            <Link to="/catalog" style={{ color: 'white', textDecoration: 'none' }}>Catalog</Link>
        </nav>
    )
}
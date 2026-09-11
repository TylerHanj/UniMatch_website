import { Link } from 'react-router-dom'

export default function Header() {
    return (
        <nav style={{ background: '#333', padding: '15px', display: 'flex', gap: '15px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
            <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
        </nav>
    )
}
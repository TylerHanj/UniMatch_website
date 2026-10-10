import { Link } from 'react-router-dom'
import logo from '../assets/logo_site.png';
import './Header.css'

export default function Header() {
    return (
        <header className="header-container">
            <nav className="header-nav">
                <Link to="/" title={'Home'}><img src={logo} alt=""/>UniMatch</Link>
            </nav>
        </header>
    )
}
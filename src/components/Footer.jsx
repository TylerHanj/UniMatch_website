import { Link } from 'react-router-dom'
import roadmap from '../assets/roadmap_icon-Photoroom.png';
import home from '../assets/home_icon-Photoroom.png';
import profile from '../assets/profile_icon.png';
import comparison from '../assets/comparison.png';
import catalog from '../assets/catalog.png';
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer-container">
            <nav className="footer-nav">
                <Link to="/" title={'Home'}><img src={home} alt="home   "/></Link>
                <Link to="/profile" title={'Profile'}><img src={profile} alt=""/></Link>
                <Link to="/roadmap" title={'Roadmap'}><img src={roadmap} alt=""/></Link>
                <Link to="/comparison" title={'Comparison'}><img src={comparison} alt=""/></Link>
                <Link to="/catalog" title={'Catalog'}><img src={catalog} alt=""/></Link>
            </nav>
        </footer>
    )
}
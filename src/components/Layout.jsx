import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'

export default function Layout({userProfile, setUserProfile}) {
    return (
        <div className="layout-wrapper">
            <Header />

            <main className="main-content">
                <Outlet context={{ userProfile, setUserProfile }} />
            </main>

            <Footer />
        </div>
    )
}
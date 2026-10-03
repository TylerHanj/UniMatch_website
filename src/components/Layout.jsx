import { Outlet } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'

export default function Layout() {
    const { userProfile, setUserProfile } = useProfile()

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

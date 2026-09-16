import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'

export default function Layout() {
    return (
        <div className="layout-wrapper">
            <Header />

            <main className="main-content"z>
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}
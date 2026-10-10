import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Roadmap from './pages/Roadmap';
import Comparison from './pages/Comparison';
import Catalog from './pages/Catalog';
import Auth from './pages/Auth';

function ProtectedLayout() {
    const { sessionUser, loading } = useProfile();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#121215',
                color: '#c5a880',
                fontFamily: 'serif',
                fontSize: '1.2rem'
            }}>
                ✨ Загрузка академической сессии...
            </div>
        );
    }

    if (!sessionUser) {
        return <Navigate to="/auth" replace />;
    }

    return <Layout />;
}

const router = createBrowserRouter([
    {
        path: '/auth',
        element: <Auth />
    },
    {
        path: '/',
        element: <ProtectedLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'profile', element: <Profile /> },
            { path: 'roadmap', element: <Roadmap /> },
            { path: 'comparison', element: <Comparison /> },
            { path: 'catalog', element: <Catalog /> },
        ],
    },
]);

export default function App() {
    return (
        <ProfileProvider>
            <RouterProvider router={router} />
        </ProfileProvider>
    );
}
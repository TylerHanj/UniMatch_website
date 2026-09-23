import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Roadmap from './pages/Roadmap';
import Comparison from './pages/Comparison';
import Catalog from './pages/Catalog';
import Settings from './pages/Settings';

const DEFAULT_PROFILE = {
    fullName: "Dias Taubaev",
    major: "Computer Science",
    countries: "United States, Germany",
    gpa: "3.8 / 4.0",
    testScores: "IELTS 7.5, SAT 1450",
    budget: "Partial Scholarship / Medium",
    notes: "Interested in AI, Software Engineering, and research opportunities"
};

export default function App(){
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem("unimatch_user_profile");
        return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    });

    useEffect(() => {
        localStorage.setItem("unimatch_user_profile", JSON.stringify(userProfile));
    }, [userProfile]);

    const router = createBrowserRouter([
        {
            path: '/',
            element: <Layout userProfile={userProfile} setUserProfile={setUserProfile} />,
            children: [
                {
                    path: '/',
                    element: <Home />,
                },
                {
                    path: '/profile',
                    element: <Profile />,
                },
                {
                    path: '/roadmap',
                    element: <Roadmap />,
                },
                {
                    path: '/comparison',
                    element: <Comparison />,
                },
                {
                    path: '/catalog',
                    element: <Catalog />,
                },
                {
                    path: '/settings',
                    element: <Settings />,
                },
            ],
        },
    ]);

    return <RouterProvider router={router}/>
}
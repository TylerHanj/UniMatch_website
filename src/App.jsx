import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Roadmap from './pages/Roadmap';
import Comparison from './pages/Comparison';
import Catalog from './pages/Catalog';
import Settings from './pages/Settings';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
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


export default function App(){
    return <RouterProvider router={router}/>
}
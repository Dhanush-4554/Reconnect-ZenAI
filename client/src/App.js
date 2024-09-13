import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CommunitySupport from './pages/CommunitySupport/CommunitySupport';
import Login from './pages/AuthPages/Login';
import './App.css';
import Register from './pages/AuthPages/Register';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/Community" element={<CommunitySupport />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}

export default App;

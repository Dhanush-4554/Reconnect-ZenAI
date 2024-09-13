import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CommunitySupport from './pages/CommunitySupport/CommunitySupport';
import Login from './pages/AuthPages/Login';
import HomePage from './pages/homePage/HomePage';
import Ai from './pages/ai/page';
import Register from './pages/AuthPages/Register';

import './App.css';


function App() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
      <Route exact path ="/home" element ={<HomePage />} />
      <Route exact path="/register" element={<Register />} />
      <Route exact path="/login" element={<Login/>} />
      <Route exact path="/ai" element={<Ai />} />
      <Route exact path="/community" element={<CommunitySupport />} />
    </Routes>
  );
}

export default App;

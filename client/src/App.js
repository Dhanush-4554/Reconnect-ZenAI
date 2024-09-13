import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CommunitySupport from './pages/CommunitySupport/CommunitySupport';
import Login from './pages/AuthPages/Login';
import HomePage from './pages/homePage/HomePage';

import './App.css';


function App() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
      <Route exact path ="/home" element ={<HomePage />} />
    </Routes>
  );
}

export default App;

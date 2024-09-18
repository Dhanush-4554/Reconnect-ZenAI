import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CommunitySupport from './pages/CommunitySupport/CommunitySupport';
import Login from './pages/AuthPages/Login';
import HomePage from './pages/homePage/HomePage';
import Register from './pages/AuthPages/Register';
import DMPage from './pages/CommunitySupport/DM/DMPage';
import FaceEmotionDetection from './pages/ai/assitant';
import './App.css';


function App() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
      <Route exact path ="/home" element ={<HomePage />} />
      <Route exact path="/register" element={<Register />} />
      <Route exact path="/login" element={<Login/>} />
      <Route exact path="/community" element={<CommunitySupport />} />
      <Route exact path="/community/dm" element={<DMPage />} />
      <Route exact path="/assist" element={<FaceEmotionDetection />} />
    </Routes>
  );
}

export default App;

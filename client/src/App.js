import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CommunitySupport from './pages/CommunitySupport/CommunitySupport';
import Login from './pages/AuthPages/Login';
import './App.css';


function App() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;

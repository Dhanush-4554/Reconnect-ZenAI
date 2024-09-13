import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import './App.css';
import Ai from './pages/ai/page';


function App() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
      <Route exact path="/ai" element={<Ai />} />
    </Routes>
  );
}

export default App;

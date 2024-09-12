import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import './App.css';


function App() {
  return (
    <Routes>
      <Route exact path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;

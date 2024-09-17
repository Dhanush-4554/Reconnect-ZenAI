import React, { useState, useEffect } from "react";
import bg from "./homePage-bg.jpeg";
import "./homePage.css"; 

const HomePage = () => {
  return (
    <div className="homepage-container">
      <MainSection />
      <Footer />
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const newBgOpacity = Math.min(scrollTop / 30, 0.8);
      setBgOpacity(newBgOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="navbar"
      style={{ backgroundColor: `rgba(31, 41, 55, ${bgOpacity})` }}
    >
      <h1 className="logo">Reconnect</h1>

      <button onClick={toggleNavbar} className="menu-button">
        menu
      </button>

      <ul className={`nav-links ${isOpen ? "nav-open" : ""}`}>
        <li className="nav-item">Zen-AI</li>
        <li className="nav-item">Community</li>
        <li className="nav-item">Blogs</li>
      </ul>
    </div>
  );
};

const MainSection = () => (
  <section className="main-section">
    <img src={bg} alt="Background" className="background-image" />
    <Navbar />
    <div className="overlay"></div>
    <div className="main-text">
      <h2 className="title">Real-time Emotion Detection</h2>
      <p className="subtitle">
        AI-driven assistance to detect and display real-time emotions based on
        facial expressions.
      </p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <p className="footer-text">Idre nemdiyagi irbeku</p>
  </footer>
);

export default HomePage;

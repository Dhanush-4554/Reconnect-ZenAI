import React, { useState, useEffect } from "react";
import bg from "./back-ground.jpeg";

const HomePage = () => {
  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-[#0d0f2d] to-[#010102]">
      <MainSection />
      <Footer />
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0); // State to track navbar background opacity

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Adjust the background opacity based on scroll position (the more you scroll, the higher the opacity)
      const newBgOpacity = Math.min(scrollTop / 30, 0.8); // Change 300 to control how fast opacity changes
      setBgOpacity(newBgOpacity);
    };

    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        style={{ backgroundColor: `rgba(31, 41, 55, ${bgOpacity})` }} // Dynamic background color with opacity
        className="flex justify-between items-center px-6 py-4 fixed top-0 left-0 w-full z-[200] transition-colors duration-500"
      >
        <h1 className="text-3xl font-bold text-white">Reconnect</h1>

        <button
          onClick={toggleNavbar}
          className="block md:hidden text-white focus:outline-none"
        >
          menu
        </button>

        <ul className="hidden md:flex space-x-4 text-white">
          <li className="hover:text-orange-400">Zen-AI</li>
          <li className="hover:text-orange-400">community</li>
          <li className="hover:text-orange-400">Blogs</li>
        </ul>

        {isOpen && (
          <ul className="absolute top-full left-0 w-full bg-gray-800 bg-opacity-60 p-4 flex flex-col space-y-4 md:hidden">
            <li className="hover:text-orange-400">Zen-AI</li>
            <li className="hover:text-orange-400">community</li>
            <li className="hover:text-orange-400">Blogs</li>
          </ul>
        )}
      </div>
    </>
  );
};

const MainSection = () => (
  <section className="relative flex flex-col items-center justify-center text-center min-h-screen overflow-hidden">
    {/* Background Image */}
    <img
      src={bg}
      alt="Background"
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* Navbar */}
    <Navbar />

    {/* Optional dark overlay for better text readability */}
    <div className="absolute inset-0 bg-black opacity-50"></div>

    {/* Text Content */}
    <div className="relative z-10">
      <h2 className="text-4xl font-bold text-white mb-6">
        Real-time Emotion Detection
      </h2>
      <p className="text-lg text-gray-300 mb-4">
        AI-driven assistance to detect and display real-time emotions based on facial expressions.
      </p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-800 p-6 ">
    <p className="text-center">Idre Avanamman nemdiyagi irbeku</p>
  </footer>
);

export default HomePage;

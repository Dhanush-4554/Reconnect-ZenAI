// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./LandingPage.css";
// import hero from "./hero3.png";
// import voice from "./voice.png";
// import video from "./video.png";
// import ai from "./ai.png";
// import mental from "./mental.png";
// import happy from "./happy.png";
// import Footer from "../../components/layout/Footer.jsx";
// function LandingPage() {
//   const navigate = useNavigate();
//   return (
//     <div className="LandingPage">
//       <nav className="nav-bar">
//         <div className="logo">Logo.</div>
//         <div className="nav-items">
//           <button
//             className="poppins-medium"
//             onClick={() => navigate("/register")}
//           >
//             Register
//           </button>
//           <button className="poppins-medium" onClick={() => navigate("/login")}>
//             Login
//           </button>
//         </div>
//       </nav>
//       <div className="land">
//         <div className="land-body">
//           <h1 className="poppins-bold">Personal AI Counsellor</h1>
//           <div className="land-content">
//             <p className="poppins-light">
//               The Personal AI Counsellor offers tailored emotional support using
//               advanced AI technology. It provides real-time insights and
//               personalized advice, helping users manage stress, enhance
//               well-being, and make informed decisions.
//             </p>
//           </div>
//           <div className="land-start">
//             <a href="/">
//               <button className="bn632-hover bn20">Explore</button>
//             </a>
//           </div>
//         </div>
//         <div className="hero">
//           <img className="hero-img" src={hero} alt="hero" />
//         </div>
//       </div>

//       <hr />

//       <div className="land-specs">
//         <div>
//           <div className="ft-img">
//             <img src={voice} alt="voice-assist" />
//           </div>
//           <div className="ft-desc">
//             <h4 className="poppins-semibold">Voice Analysis</h4>
//             <ul className="poppins-extralight">
//               <li>Emotion Detection</li>
//               <li>Real-Time Insights</li>
//             </ul>
//           </div>
//         </div>
//         <div>
//           <div className="ft-img">
//             <img src={video} alt="facial-detection" />
//           </div>
//           <div className="ft-desc">
//             <h4 className="poppins-semibold">Facial Detection</h4>
//             <ul className="poppins-extralight">
//               <li>Emotion Recognition</li>
//               <li>Non-verbal Cues</li>
//             </ul>
//           </div>
//         </div>
//         <div>
//           <div className="ft-img">
//             <img src={ai} alt="ai-assist" />
//           </div>
//           <div className="ft-desc">
//             <h4 className="poppins-semibold">AI Assistance</h4>
//             <ul className="poppins-extralight">
//               <li>Personlised Guidance</li>
//               <li>24/7 Availability</li>
//             </ul>
//           </div>
//         </div>
//         <div>
//           <div className="ft-img">
//             <img src={mental} alt="mental-wellbeing" />
//           </div>
//           <div className="ft-desc">
//             <h4 className="poppins-semibold">Mental Wellbeing</h4>
//             <ul className="poppins-extralight">
//               <li>Emotional Support</li>
//               <li>Self-Care Insights</li>
//             </ul>
//           </div>
//         </div>
//         <div>
//           <div className="ft-img">
//             <img src={happy} alt="happy-life" />
//           </div>
//           <div className="ft-desc">
//             <h4 className="poppins-semibold">Happy Life</h4>
//             <ul className="poppins-extralight">
//               <li>Fulfillment and Joy</li>
//               <li>Balanced Living</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }

// export default LandingPage;

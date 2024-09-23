import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'
import Logout from '../../pages/AuthPages/Logout';

const Header = () => {
    const navigate = useNavigate();

    const isLoggedIn = () => {
        return localStorage.getItem('authToken') !== null;
    };

    const handleChannelNavigate = () => {
        navigate('/community')
    }
    const handleAssistNavigate = () => {
        navigate('/assist')
    }
    const handleBlogNavigate = () => {
        navigate('/blog')
    }

    return (
        <>
            <div className='header-layout'>
                <div className="home-logo">
                    Reconnect.
                </div>
                {isLoggedIn() ? (
                    <div className="home-nav-links">
                        <p onClick={handleAssistNavigate}>ZenAI</p>
                        <p onClick={handleChannelNavigate}>Community</p>
                        <p onClick={handleBlogNavigate}>Blogs</p>
                        <Logout />
                    </div>
                ) : (

                    <div className="nav-items">
                        <button
                            className="poppins-medium"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                        <button
                            className="poppins-medium"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default Header

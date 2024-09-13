import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SideBar from './SideBar';
import ChatPanel from './ChatPanel';
import ChatArea from './ChatArea';
import './communityPage.css';

const CommunitySupport = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            toast.info('Please log in to access all features');
            navigate('/login');
        }
    }, [navigate]);

    if (!isLoggedIn) {
        return <p>Loading...</p>;
    }

    return (
        <div className="community-main-page">
            <SideBar />
            <ChatPanel />
            <ChatArea />
        </div>
    );
};

export default CommunitySupport;

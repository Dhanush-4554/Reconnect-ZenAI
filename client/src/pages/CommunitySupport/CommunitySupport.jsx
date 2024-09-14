import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import SideBar from './SideBar';
import ChatPanel from './ChatPanel';
import ChatArea from './ChatArea';
import './communityPage.css';

const socket = io.connect('http://localhost:5000');

const CommunitySupport = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeChannel, setActiveChannel] = useState('General Support');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            toast.info('Please log in to access all features');
            navigate('/login');
        }

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    const handleChannelChange = (channel) => {
        setActiveChannel(channel);
    };

    if (!isLoggedIn) {
        return <p>Loading...</p>;
    }

    return (
        <div className="community-main-page">
            <SideBar />
            <ChatPanel onChannelChange={handleChannelChange} activeChannel={activeChannel} />
            <ChatArea socket={socket} activeChannel={activeChannel} />
        </div>
    );
};

export default CommunitySupport;

import React from 'react';
import './communityPage.css';

const ChatPanel = ({ onChannelChange, activeChannel }) => {
    return (
        <div className="chat-panel">
            <div
                className={`channel ${activeChannel === 'General Support' ? 'active' : ''}`}
                onClick={() => onChannelChange('General Support')}
            >
                General Support
            </div>
            <div
                className={`channel ${activeChannel === 'Addiction Recovery' ? 'active' : ''}`}
                onClick={() => onChannelChange('Addiction Recovery')}
            >
                Addiction Recovery
            </div>
            <div
                className={`channel ${activeChannel === 'Friendly Talks' ? 'active' : ''}`}
                onClick={() => onChannelChange('Friendly Talks')}
            >
                Friendly Talks
            </div>
        </div>
    );
};

export default ChatPanel;

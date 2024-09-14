const Message = require('../../models/messageModel');

const getMessagesByChannel = async (req, res) => {
    const { channel } = req.params;
    try {
        const messages = await Message.find({ channel }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};

const saveMessage = async (username, message, channel) => {
    try {
        const newMessage = new Message({ username, message, channel });
        await newMessage.save();
    } catch (error) {
        console.error('Error saving message:', error);
    }
};

module.exports = { getMessagesByChannel, saveMessage };

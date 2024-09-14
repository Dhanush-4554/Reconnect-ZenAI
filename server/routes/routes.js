const express = require('express');
const router = express.Router();


// import controllers
const registerController = require("../controllers/authControllers/register");
const loginController = require("../controllers/authControllers/Login");
const testController = require("../controllers/testController");
const { getMessagesByChannel } = require('../controllers/chatControllers/messageController');


// routes
router.post('/register', registerController); 
router.post('/login', loginController); 
router.get('/', testController.sayHello); 
router.get('/messages/:channel', getMessagesByChannel);

module.exports = router;
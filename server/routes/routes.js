const express = require('express');
const router = express.Router();
const controller = require('../controllers/testController'); 

// dummy route for testing 
router.get('/', controller.sayHello); 

module.exports = router;
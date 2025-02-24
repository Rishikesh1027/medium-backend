const express=require('express');
const { addMessage ,getMessages,getChatUsers} = require('../controller/messageController.js');

const router=express.Router();


router.post('/addmessage',addMessage);
router.get('/getmessages/:currentUserId/:chatPartnerId',getMessages);
router.get('/getusers/:user_id',getChatUsers);


module.exports= router;
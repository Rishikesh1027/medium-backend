const express=require('express');
const { sendNotification,fetchNotification} = require('../controller/notificationController');
const router=express.Router();
router.put('/isnotificationread/:user_id',sendNotification);
router.get('/fetchnotification/:user_id',fetchNotification)
module.exports= router;
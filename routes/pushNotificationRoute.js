const express=require('express');
const webpush = require("web-push");
const { pushNotification} = require('../controller/pushNotificatinController.js');
const router=express.Router();
const publicVapidKey ="BET-7Qa5nSfHlTwUA6F_rc2FkVh_h9gNY6mnBEyEIK2LN-ZwHj-cPzqUTr6rmX0oosVZg5_PUucP2BaS9_trEIk";
const privateVapidKey = "31DifDEcXuuY-qR9mx8eOElOfzV8o7g3eQmBZYGlzao";
webpush.setVapidDetails("mailto:rishikesh@almabay.com",
publicVapidKey,privateVapidKey);


router.post("/subscribe",pushNotification);

module.exports= router;
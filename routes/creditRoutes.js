const express=require('express');   
const { addCredit ,fetchCredit,deductCredit} = require('../controller/creditController');
const router=express.Router();
router.post('/addcredit',addCredit);
router.get('/fetchcredit/:user_id',fetchCredit);
router.put('/deductcredit/:user_id',deductCredit);
module.exports= router;
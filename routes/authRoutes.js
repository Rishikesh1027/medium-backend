const express=require('express');
const { signup ,login, getUser, updateUser, deleteUser} = require('../controller/authControllers');
const router=express.Router();
router.post('/signup',signup);
router.post('/login',login);
router.post('/getuser',getUser);
router.put('/updateuser',updateUser);
router.delete('/deleteuser',deleteUser);
module.exports= router;
const express=require('express');
const { search} = require('../controller/searchController');
const router=express.Router();
router.get('/search/:title',search);
module.exports= router;
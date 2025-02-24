const express=require("express");
const {writeBlog, editblog, fetchblogById, updateclap, fetchAllBlogs}=require("../controller/blogControllrs.js")

const router=express.Router();

router.post('/writeblog',writeBlog);
router.put('/updateblog',editblog);
router.get('/getblogbyid/:user_id',fetchblogById);
router.get('/getallblogs',fetchAllBlogs);
router.put('/updateclap',updateclap);

module.exports=router;
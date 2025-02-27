const express=require('express');
const router=express.Router();
const {addRemoveFollower, findFollower,getFollowerBlog,getUserBlogById}=require('../controller/followControllers.js');

router.get('/addremovefollower/:user_id/:publisher_id',addRemoveFollower);
router.get('/finduser/:user_id/:publisher_id',findFollower);
router.get('/fetchfollowerblog/:user_id',getFollowerBlog);
router.get('/fetchfollowerblog/:user_id',getUserBlogById);
module.exports=router;

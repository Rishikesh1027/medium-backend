const express=require('express');
const router=express.Router();
const {createComment, deleteComment, fetchComments, updateComment}=require('../controller/commentControllers.js');

router.post('/addcomment',createComment);
router.delete('/deletecomment/:comment_id',deleteComment);
router.post('/fetchallcomments',fetchComments);
router.put('/updatedcomment',updateComment);
module.exports=router;

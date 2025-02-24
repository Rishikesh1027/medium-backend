const express=require("express");
const {addToLibrary, fetchAllLibrary, removeFromLibrary, addandremovefromLibrary}=require("../controller/libraryController.js")

const router=express.Router();

router.post('/addandremovefromLibrary',addandremovefromLibrary);
router.get('/getlibrary/:user_id',fetchAllLibrary);
router.delete('/removefromlibrary',removeFromLibrary);

module.exports=router;
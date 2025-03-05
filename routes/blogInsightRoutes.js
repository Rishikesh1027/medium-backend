
const express = require("express");
const {
    handleBlogInsight,fetchBlogInsight
} = require("../controller/blogInsightController");

const router = express.Router();

router.post("/updateinsight", handleBlogInsight);
router.get("/fetchinsights/:user_id",fetchBlogInsight)
module.exports = router;
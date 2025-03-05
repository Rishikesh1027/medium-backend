require("dotenv").config();
const { Client } = require("@neondatabase/serverless");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});

async function addandremovefromLibrary(req,res){
    const {blog_id,user_id}=req.body;
    try{
        const getresponse=await client.query(
            `SELECT * FROM library WHERE blog_id=$1 AND user_id=$2`,[blog_id,user_id]
        )
        if(getresponse.rowCount===0){
            const response = await client.query(
                `INSERT INTO "library" (user_id, blog_id) VALUES ($1,$2) RETURNING *`,
                [user_id, blog_id]
              );
              return res.status(201).json({message:"Added to library"});
        }
        else{
            try{
                const response=await client.query(
                    `delete from "library" where user_id=$1 and blog_id=$2`,[user_id,blog_id]
                );
                res.status(200).json({message:"Item removed!"});
            }catch(err){
                res.status(500).json({Error:err});
            }
        }





       
    }catch(err){
        res.status(500).json({Error:err});
    }
}


async function fetchAllLibrary(req,res) {
    const {user_id}=req.params;
    try{
        const response=await client.query(
            `select * from blog where blog_id in (select blog_id from "library" where user_id=$1)`,[user_id]
        );
        res.status(200).json(response.rows);
    }catch(err){
        res.status(500).json({Error:err});
    }
    
}


async function removeFromLibrary(req,res) {
    const {user_id,blog_id}=req.body;
    try{
        const response=await client.query(
            `delete from "library" where user_id=$1 and blog_id=$2`,[user_id,blog_id]
        );
        res.status(200).json({message:"Item removed!"});
    }catch(err){
        res.status(500).json({Error:err});
    }
}

module.exports={addandremovefromLibrary,fetchAllLibrary,removeFromLibrary}
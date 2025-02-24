require('dotenv').config();
const { Client } = require('@neondatabase/serverless');

const client = new Client({
  connectionString: process.env.DATABASE_URL,  
});

// Optional: Connect explicitly if needed
client.connect().catch(err => {
  console.error("Failed to connect to the database:", err);
});


async function signup(req, res) {
    // console.log(req.body);
    const { fullname, email, password } = req.body;
    
    try {
        const isUser=await client.query(
            `SELECT * FROM "user" WHERE email = $1`,[email]
        )
        if(isUser.rows.length>0){
            return res.status(400).json({message:"user already exists"});
        }
        const result = await client.query(
            `INSERT INTO "user" (fullname, email, password) VALUES ($1, $2, $3) RETURNING *`,
            [fullname, email, password]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function  login(req,res) {
    const {email,password}=req.body;
    try{
        const isUserExists=await client.query(
            `SELECT fullname,email,bio,pronouns,user_id FROM "user" WHERE email = $1 and password= $2`,[email,password]
        )
       
        if(isUserExists.rowCount===0){
            console.log("password wrong")
            return res.status(401).json({message:"Email or password is incorrect!...try again."});
        }
        return res.status(200).json(isUserExists.rows[0]);
    }catch(err){
        res.json({error:err})
    }
    
}

async function  getUser(req,res) {
    console.log(req.body)
    const {email,user_id}=req.body;
    try{
        const user=await client.query(
            `SELECT * FROM "user" WHERE email=$1 OR user_id=$2`,[email,user_id]
        )
        return res.status(200).json(user.rows[0])

    }catch(err){
        res.json({error:err})
    }
}

async function updateUser(req,res) {
    console.log(req.body)
    const {fullname,email,pronouns,bio,profile}=req.body;
    try{
        const user=await client.query(
            `UPDATE "user" SET fullname=$1, bio=$2, pronouns=$3, profile=$4 WHERE user_id=$5`,[fullname,bio,pronouns,profile,email]
        )
        return res.status(200).json(user)
    }catch(err){
        res.json({error:err})
    }
    
}

async function  deleteUser(req,res) {
    const {email}=req.body;
    try{
        const result=await client.query(
            `DELETE FROM "user" WHERE email=$1`,[email]
        )
        res.status(200).json({message:"User deleted!"});
    }catch(err){
        res.status(500).json({error:err})
    }
}

module.exports = { signup ,login,getUser,updateUser,deleteUser};

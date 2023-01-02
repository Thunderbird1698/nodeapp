const express = require('express');
const router = express.Router();
const posts = require("../models/post");
const multer = require('multer');
const upload = multer({dest:'uploads/'});
const {regisvalidation} = require('../validation');
const bcryptjs = require("bcryptjs");
require("dotenv").config();
const { func } = require("@hapi/joi");
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

const bucketName = process.env.bucket_AWS_name
const region = process.env.aws_bucket_region
const accessKeyId = process.env.aws_access_key
const secretAccessKey = process.env.aws_secret_key

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

//Add new post
router.post("/",async (req,res)=>{

    //Validation
    var {error} = regisvalidation(req.body);
    if(error) return res.status(400).send("Error");

    //Email check
    const emailcheck = await posts.findOne({email: req.body.email});
    if(emailcheck){
        return res.status(400).send("Email already exists");
    }

    //Password Hashing
    const salt = await bcryptjs.genSalt(10);
    const hashpw = await bcryptjs.hash(req.body.password, salt);


    const post = new posts({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: hashpw
    });

    try{
    const savedpost = await post.save();
    res.json(savedpost);   
    }catch(err){
        res.json({ Message : err})
    }
});

//Login post
router.post('/login',async (req,res)=>{
    //Validation
    var {error} = regisvalidation(req.body);
    if(error) return res.status(400).send("Error");

        //Email check
        const emailcheck = await posts.findOne({email: req.body.email});
        if(!emailcheck) return res.status(400).send("Email does not exists");
        
        const pwd = await bcryptjs.compare(req.body.password,emailcheck.password);
        if(!pwd) return res.status(400).send("Email or password is wrong");

        res.send("Logged in");
});

//Get all post
router.get('/',async (req,res)=>{
    try {
        var allData = await posts.find();
        res.json({ Sucess : true, Message : "Data get successful" ,Data : allData});
    } catch (err) {
        res.json({ Message : err})
    }
});

//Get specific post
router.get("/:postId",async (req,res)=>{
    try {
        const pfind = await posts.findById(req.params.postId);
        res.json({ Success: true, Message:"Data found" ,Data:pfind});
    } catch (error) {
        res.json({ Message : error})
    }
});

//Update post
router.patch('/:postID',async (req,res)=>{
    try {
        const updatedp = await posts.updateOne({_id: req.params.postID}, 
                        {$set: {lastname: req.body.lastname}});
        res.json({ Success: true, Message: "Data updated", Data:updatedp});
    } catch (error) {
        res.json({ Message: error})
    }
})

//upload photo
router.post('/images',upload.single('image'), async (req,res)=>{
    try {
        const file = req.file;
        var awsres = await uploadFile(file);
        res.send("image uploaded");
    } catch (error) {
        console.log("2");
        res.json({Message: error})
    }
});

//get AWS image key
router.get('/images/:imageId', async (req, res) => {

    const { imageId } = req.params;
    var params = { Bucket: bucketName, Key: imageId };
    s3.getObject(params,(err,data)=>{
        if(err){
            console.log(err)
        }
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    res.write(data.Body, 'binary');
    res.end(null, 'binary');
    })
});

//Delete post
router.delete('/:postId', async (req,res)=>{
    try {
        const removepost = await posts.remove({ _id : req.params.postId});
        res.json({ Success: true, Message: "Data removed", Data: removepost});
    } catch (error) {
        res.json({ Message : error})
    }
})

//upload file
function uploadFile(file) {
    const filestream = fs.createReadStream(file.path)

    const uploadparam = {
        Bucket: bucketName,
        Body: filestream,
        Key: file.filename
    }

    return s3.upload(uploadparam).promise()
}

module.exports = router;
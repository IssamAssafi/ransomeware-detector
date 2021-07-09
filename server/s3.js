const AWS = require('aws-sdk');
const fs = require('fs');
const env = require('en')
require('dotenv').config({ path: '/.env' })

const s3 = new AWS.S3({
    accessKeyId: process.env.KEY,
    secretAccessKey: process.env.SECRET
});

const localDestination = "downloads/dv.jpg";
const email="issam@gmail.com";

const uploadFile = (localDestination,email) => {
    fs.readFile(localDestination, (err, data) => {
       if (err) throw err;
       const filename = localDestination.split("/")[1];
       const ext = filename.split(".")[filename.split(".").length-1];
       
       const name = filename.split(".");
       name.pop();
    
       const params = {
           Bucket: 'dsti-project', // pass your bucket name
           Key: `${name}-${email}.${ext}`, // file will be saved as testBucket/contacts.csv
           Body: JSON.stringify(data, null, 2)
       };
       s3.upload(params, function(s3Err, data) {
           if (s3Err) throw s3Err
           console.log(`File uploaded successfully at ${data.Location}`)
       });
    });
};


uploadFile(localDestination,email);
  
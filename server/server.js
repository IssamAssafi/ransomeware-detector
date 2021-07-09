const express = require('express')
const app = express()
const port = 3000

const AWS = require('aws-sdk');
const http = require('http'); // or 'https' for https:// URLs
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const path = require('path');
const URL = require('url').URL;
const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const s3 = new AWS.S3({
    accessKeyId: process.env.KEY,
    secretAccessKey: process.env.SECRET
});

app.get('/', async (req, res) => {
  //downloadFile("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg");
  //const dest = await download("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg");
  res.send("Hello World");
})

app.post('/file-analysis', async (req, res) => {
    console.log("post request received")
    const finalUrl = req.body.finalUrl;
    const email = req.body.email;
    const type = req.body.type;
    const localDestination = await download(finalUrl,type);
    console.log(`File downloaded, path = ${localDestination}, and will be sent to amazon s3 bucket, user email is = ${email}`);
    uploadFile(localDestination,email);
    res.send(`File downloaded, path = ${localDestination}, and will be sent to amazon s3 bucket, user email is = ${email}`);
  })

  const uploadFile = (localDestination,email) => {
    fs.readFile(localDestination, (err, data) => {
       if (err) throw err;
       const filename = localDestination.split("/")[1];
       const ext = filename.split(".")[filename.split(".").length-1];
       
       const name = filename.split(".");
       name.pop();
    
       const params = {
           Bucket: 'dsti-project', // pass your bucket name
           Key: `${name}_.${email}.${ext}`, // file will be saved as testBucket/contacts.csv
           Body: JSON.stringify(data, null, 2)
       };

       console.log(params.Key)
       s3.upload(params, function(s3Err, data) {
           if (s3Err) throw s3Err
           console.log(`File uploaded successfully at ${data.Location}`)
       });
    });
};
  

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


const downloadFile = (url)=>{
    const fileName = path.basename(url);
    const file = fs.createWriteStream(`downloads/${fileName}`);
    const request = http.get(url, function(response) {
  response.pipe(file);
});}


function download(url,type) {
    console.log(url);
    return new Promise((resolve, reject) => {

        const fileName = path.basename(url);
        //const dest = `downloads/${fileName}`;
        const dest = `downloads/${uuidv4()}.${type}`
        console.log(dest);
        const file = fs.createWriteStream(dest, { flags: "wx" });

        const downloadURL = new URL(url);
        let protocol;
        if(downloadURL.protocol==="https:")
            protocol=https;
        else
            protocol=http;

        const request = protocol.get(url, response => {    
            if (response.statusCode === 200) {
                response.pipe(file);
            } else {
                file.close();
                fs.unlink(dest, () => {}); // Delete temp file
                reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        });

        request.on("error", err => {
            file.close();
            fs.unlink(dest, () => {}); // Delete temp file
            reject(err.message);
        });

        file.on("finish", () => {
            console.log("download is finished");
            resolve(dest);
        });

        file.on("error", err => {
            file.close();

            if (err.code === "EEXIST") {
                reject("File already exists");
            } else {
                fs.unlink(dest, () => {}); // Delete temp file
                reject(err.message);
            }
        });
    });
}

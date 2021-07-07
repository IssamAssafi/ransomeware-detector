const express = require('express')
const app = express()
const port = 3000

const http = require('http'); // or 'https' for https:// URLs
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const path = require('path');
const URL = require('url').URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
  //downloadFile("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg");
  //const dest = await download("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg");
  res.send("Hello World");
})

app.post('/file-analysis', async (req, res) => {
    console.log("post request received")
    const finalUrl = req.body.finalUrl;
    const email = req.body.email;
    const localDestination = await download(finalUrl);
    res.send(`File downloaded, path = ${localDestination}, and will be sent to amazon s3 bucket, user email is = ${email}`);
  })
  

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


const downloadFile = (url)=>{
    const fileName = path.basename(url);
    const file = fs.createWriteStream(`downloads/${fileName}`);
    const request = http.get(url, function(response) {
  response.pipe(file);
});}


function download(url) {

    return new Promise((resolve, reject) => {
        const fileName = path.basename(url);
        const dest = `downloads/${fileName}`;
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

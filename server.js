const express = require("express");
const app = express();
require("dotenv").config()
const bodyParser = require("body-parser")
const cors = require("cors")
const nodemailer = require("nodemailer")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

const path=require('path')
app.use(express.static(path.join(__dirname,'build')))
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'build','index.html'))
    
})



app.use(express.json())
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.cgptkey,
  });
const openai=new OpenAIApi(configuration)


app.post('/send_mail',cors(),async (req,res)=>{
  console.log('incoming request',req.body)
  let { fullName,email,zip,city,message } = req.body
  
  console.log(fullName,email,zip,city,message)


  ///
  let theprompt=`Write a reply of max 100 tokens as a pet adoption company named SmellyCat to a fan named ${fullName}.
  He is from ${city}.His message that you have to reply to is ''${message}''. `
  ///

  const response = await openai.createCompletion({
     model: "text-davinci-003",
    //  model: "text-ada-001",
     prompt: theprompt,
     max_tokens: 100,
     temperature: 0,
     top_p: 1.0,
     frequency_penalty: 0.0,
     presence_penalty: 0.0
   });
  
  let textResponse=response.data.choices[0].text
  
  console.log(textResponse)
    const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      secure: true,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
        
    })

    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Greetings from SmellyCat!",
      html: `<div className="email" style="
          border: 1px solid black;
          padding: 20px;
          font-family: sans-serif;
          line-height: 2;
          font-size: 20px; 
          ">
          <h1>Smellycat - Pawsitively Amazing Furever Friends</h1>
          <br/>
          <p>${textResponse}</p>
          <br/>
          <p>All the best,</p>
          <p>SmellyCat</p>
          </div>
      `
    })

    res.send('success')
})




app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
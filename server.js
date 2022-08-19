const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
// app.use(express.text());

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use('/uploads', express.static('uploads'));
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

/**
 * PINGER OUTSIDE ROUTES
 */
app.get('/', (req, res) => {
    res.json({ message: 'PING 🚀'})
})

/**
 * Twilio SMS test
 */

// app.post('/sms', (req, res) => {
//   const { message, user:sender, type, members } = req.body;
//   console.log('type', type)
//   // if (type === 'message.new')
//   twilioClient.messages 
//       .create({   
//          body: `Kiosk OTP is 111111`,
//          messagingServiceSid: 'MG2b9dc718783a336cae6b16c6097a6be6',      
//          to: '+971589525878' 
//        }) 
//       .then(message => console.log(message.sid))
//       .catch((error) => { console.log(`error twilio otp ${error}`)})
//       .done();
//   return res.status(200).json({ message: 'sms sent'});
// });

/**
 * ROUTER HANDLER
 */
const route = require('./src/routes');
app.use('/api', route)

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});


/**
 * PORT CONF LIGHT UP SERVER
 */
const port = process.env.PORT || 7331
app.listen(port, () => {
    console.log(`Server running at ${port} 🚀`)
})
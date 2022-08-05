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
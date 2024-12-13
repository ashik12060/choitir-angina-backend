const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require('cors');
var cookieParser = require('cookie-parser');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require("xss-clean");
const rateLimit = require('express-rate-limit')
const hpp = require('hpp');
const axios = require('axios');
const admin = require('firebase-admin');

// firebase
const serviceAccount = require('./config/serviceAccountKey.json');

//adding socket.io configuration
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const errorHandler = require('./middleware/error');


// Configure Express to trust the 'X-Forwarded-For' header
app.set('trust proxy', 1);

//import routes

const authRoutes = require('./routes/authRoutes');
const postRoute = require('./routes/postRoute');
const productRoute = require('./routes/productRoute');
const itemRoute = require('./routes/itemRoute');
const galleryRoute = require('./routes/galleryRoute');
const orderRoutes = require('./routes/orderRoutes');
const sellerRoute = require('./routes/sellerRoutes');

// firebase initialization
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

//database connection
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
  
})
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));


//MIDDLEWARE
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({
  limit: "5mb",
  extended: true
}));
app.use(cookieParser());
app.use(cors());

app.use(cors({
    origin: [ process.env.LOCAL_SITE_URL]
  }));
  

// prevent SQL injection
app.use(mongoSanitize());

// adding security headers
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"]
    }
  })
)

app.use(xss());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
})


app.use(hpp());

//Routes
app.use('/api', authRoutes);
app.use('/api', postRoute);
app.use('/api', productRoute);
app.use('/api',itemRoute);
app.use('/api',galleryRoute);
app.use('/api', orderRoutes);
app.use('/api', sellerRoute);



app.get('/', (req, res) => {
  res.send('API is running....')
})



//error middleware
app.use(errorHandler);

//port
const port = process.env.PORT || 9000

io.on('connection', (socket) => {
  socket.on('comment', (msg) => {
    io.emit("new-comment", msg);
  })
})

exports.io = io

server.listen(port, () => {
  console.log(` Server running on port ${port}`);
})



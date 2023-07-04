const mongoose = require('mongoose');
const express = require('express');

var logger = require('morgan');
var authRouter = require('./routes/auth');
var liveRouter = require('./routes/live');
var otherRouter = require('./routes/other');
const User = require('./schema/User')
const Live = require('./schema/Lives')

const server_ip = `108.175.11.224`

require('dotenv').config();

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const NodeMediaServer = require('node-media-server');

const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http:{
    port:8000,
    allow_origin:'*'
  }
});

nms.on('postPublish', (id, streamPath, args) => {
  let session = nms.getSession(id)
  try {
    if(!mongoose.isValidObjectId(session.appname)){
      
      return
    }
    User.findOne({_id:session.appname}).then((res)=>{
      if(!res || !res._id){
        return
      }

     Live.create({
      live:id,
      user:session.appname,
      url:`http://${server_ip}:8000/${session.appname}/live.flv`
     })
    })
  } catch (error) {
    
  }
 
  io.emit('newStream', streamPath);
});




nms.on('donePublish',(id, streamPath, args)=>{
  let session = nms.getSession(id)
  try {
    if(!mongoose.isValidObjectId(session.appname)){
      
      return
    }
    User.findOne({_id:session.appname}).then((res)=>{
      
      if(!res || !res._id){
       
        return
      }
     Live.findOneAndDelete({
      live:id
     }).then((res)=>{
      return
     })
    })
  } catch (error) {
  }
})
nms.run();

http.listen(process.env.EXPRESS_PORT || 3000, async () => {
  console.log('Server running on http://localhost:3000');

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost/vueflo';
  await mongoose.connect(mongoUri, {
    keepAlive: true
  }).then(() => console.log('Connected To MongoDB')).catch(err => console.log(err));
});

io.on('connection', (socket) => {
  console.log('A user connected');


  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


// app.get('/', (req, res) => {
//   res.send('VueFlow Server');
// });
app.use('/auth', authRouter);
app.use('/lives', liveRouter);
app.use('/', otherRouter);


module.exports = app;

// mongoose.connect('mongodb://localhost/vueflo');
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function callback() {
//   console.log("Database Connected : mongodb");
// });




// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
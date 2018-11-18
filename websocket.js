//export so that accessible in app.js
//server param is a http server
exports.createServer = function(server,app){
  //Create websocket server from http server
  const io = require('socket.io')(server)

  const port = process.env.BUSTIMINGS_PORT || '8081'
  const hostname = process.env.BUSTIMINGS_HOSTNAME || "localhost"
  //Prevent CSRF (sort of) by only allowing specific origins
  //Could origin spoofing be possible?
  io.origins((origin,callback)=>{
    const origins = ["https://"+hostname,"http://localhost:"+port]
    if(process.env.CI=="true"){
      //Socket-io client origin is * for some reason
      //TODO find out why and avoid if possible
      if(origin=="*"){
        console.log("\033[0;32mOrigin "+origin+" was authorised\033[0m")
        return callback(null,true)
      }
    }
    for (const authOrigin of origins){
      if(origin.startsWith(authOrigin)){
        console.log("\033[0;32mOrigin "+origin+" was authorised\033[0m")
        return callback(null,true)
      }
    }
    console.log("\033[0;31mOrigin "+origin+" was blocked\033[0m")
    return callback("Not authorised",false)
  })

  //For cookies
  io.on('connection',function(socket){
    console.log("User connected")
    //Start socket.io code here

    //Send uncaught errors, eg `callback is not a function` to client
    const uncaughtErrorHandler = require("./routes/error")(socket)

    ;(async ()=>{
      require("./routes/api")(socket,io)
    })()
    .catch(uncaughtErrorHandler)

    socket.on('disconnect', function(){
      console.log('user disconnected')
    })
  })
  return io
}
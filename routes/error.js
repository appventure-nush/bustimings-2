//yey currying
module.exports = socket => err =>{
  console.log(err)
  socket.emit("uncaughtError",err.toString())
}
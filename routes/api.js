const getData = require("../getData")
const cache = new (require("node-cache"))({
  checkperiod:2
})

let cached = false
module.exports = (socket,io)=>{
  const uncaughtErrorHandler = require("./error")(socket)

  socket.on("dataReq",callback=>{
    ;(async ()=>{
      const cachedValue = cache.get("bus-data")
      if(cachedValue!==undefined){
        console.log("Cache hit!")
        return callback(null,cachedValue)
      }
      const {results} = await getData()
      //Add data to cache
      cache.set("bus-data",results,20)
      return callback(null,results)
    })()
    .catch(e=>{
      console.log(e)
      throw e
    })
    .catch(e => callback(e.toString()))
    //Error in handling error
    .catch(uncaughtErrorHandler)
  })
  if(!cached){
    cache.on("expired",async ()=>{
      console.log("ok")
      const {results} = await getData()
      io.emit('data',results)
      console.log("pushed")
      cache.set("bus-data",results,20)
    })
    cached=true
  }
}
const express = require('express')
const router = express.Router()
const getData = require("../getData")
const cache = new (require("node-cache"))({
  stdTTL:60,
  checkperiod:50
})

router.post("/api/getData",(req,res)=>{
  ;(async ()=>{
    const cachedValue = cache.get("bus-data")
    if(cachedValue!==undefined){
      console.log("Cache hit!")
      return res.json(cachedValue)
    }
    const {results,nextBusArrival} = await getData()
    setTimeout(()=>{
      cache.del("bus-data")
      console.log("Deleted")
    },nextBusArrival-new Date().getTime())
    //Add data to cache
    cache.set("bus-data",results,60)
    return res.json(results)
  })()
  .catch(err=>{
    let code = err.code || 500
    console.log("An error occurred:",err.toString())
    res.status(code).json({
      error:true,
      message:err.toString()
    })
  })
})

module.exports = router
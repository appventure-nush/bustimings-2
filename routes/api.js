const express = require('express')
const request = require("request-promise-native")
const router = express.Router()
const cache = new (require("node-cache"))({
  stdTTL:60,
  checkperiod:50
})

const {ACCOUNT_KEY:accountKey} = process.env
if(!accountKey){
  throw new Error("Account key is not defined.")
}

router.post("/api/getData",(req,res)=>{
  ;(async ()=>{
    const cachedValue = cache.get("bus-data")
    if(cachedValue!==undefined){
      console.log("Cache hit!")
      return res.json(cachedValue)
    }
    let endpoint = 'https://api.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode='
    const options = {
      headers:{
        AccountKey: accountKey
      }
    }
    const busStops = ["16991", "17191", "17129", "17121"]
    const results = (
      await Promise.all(busStops.map(id=>
        request(`${endpoint}${id}`,options)
      )
    ))
    .map(JSON.parse)
    .map(a=>a.Services)
    for(let i=0;i<busStops.length;i++){
      for(const service of results[i]){
        service.stopId = busStops[i]
      }
    }
    //Add data to cache
    //ttl of 60 seconds, cos thats when LTA pushes new data
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
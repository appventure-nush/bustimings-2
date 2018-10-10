const express = require('express')
const request = require("request-promise-native")
const router = express.Router()


router.post("/api/getData",(req,res)=>{
  ;(async ()=>{
    const {ACCOUNT_KEY:accountKey} = process.env
    let endpoint = 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode='
    const options = {
      headers:{
        AccountKey: accountKey
      }
    }
    const busStops = ["16991", "17191", "17129", "17121"]
    const results = (await Promise.all(busStops.map(id=>request(`${endpoint}${id}`,options)))).map(JSON.parse).map(a=>a.Services)
    for(let i=0;i<busStops.length;i++){
      for(const service of results[i]){
        service.stopId = busStops[i]
      }
    }
    return res.json(results)
  })()
  .catch(err=>{
    let code = err.code || 500
    res.status(code).end(err.toString().replace("Error: ",""))
  })
})

module.exports = router
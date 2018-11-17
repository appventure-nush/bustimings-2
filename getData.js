const request = require("request-promise-native")
const {ACCOUNT_KEY:accountKey} = process.env
if(!accountKey){
  throw new Error("Account key is not defined.")
}

module.exports = async ()=>{
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

  let nextBusArrival = Infinity
  for(let i=0;i<busStops.length;i++){
    for(const service of results[i]){
      service.stopId = busStops[i]
      // Bus already come, shift buses behind forward
      if(new Date(service.NextBus.EstimatedArrival)<new Date()){
        service.NextBus = service.NextBus2
        service.NextBus2 = service.NextBus3
      }
      nextBusArrival = Math.min(new Date(service.NextBus.EstimatedArrival),nextBusArrival)
    }
  }
  return {
    results,
    nextBusArrival
  }
}
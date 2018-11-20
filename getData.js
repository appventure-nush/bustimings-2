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

  for(let i=0;i<busStops.length;i++){
    for(const service of results[i]){
      service.stopId = busStops[i]
      // Bus already come, shift buses behind forward
      if(new Date(bus.NextBus.EstimatedArrival).getTime()<new Date().getTime()){
        bus.NextBus = bus.NextBus2
        bus.NextBus2 = bus.NextBus3
        delete bus.NextBus3
      }
      if(new Date(bus.NextBus2.EstimatedArrival).getTime()<new Date().getTime()){
        bus.NextBus2 = bus.NextBus3
        delete bus.NextBus3
      }
    }
  }
  return {
    results
  }
}
const request = require("request-promise-native")
let {
  ACCOUNT_KEY: accountKey
} = process.env
if(!accountKey){
  accountKey = require("fs").readFileSync("token","utf8").trim()
}
if (!accountKey) {
  throw new Error("Account key is not defined.")
}
let cachedData;
let clearCacheTimer;

const parseTime = date => `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

module.exports = async (refreshCallback) => {
  let endpoint = 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode='
  const options = {
    headers: {
      AccountKey: accountKey
    }
  }
  const busStops = ["16991", "17191", "17129", "17121"];
  let results;
  if (cachedData) results = cachedData;
  else {
    console.log("New data fetched")
    results = (
        await Promise.all(busStops.map(id =>
          request(`${endpoint}${id}`, options)
        )))
      .map(JSON.parse)
      .map(a => a.Services);
    cachedData = results;
    clearCacheTimer = setTimeout(() => {
      cachedData = undefined;
      const time = parseTime(new Date());
      if (refreshCallback) refreshCallback({
        time,
        type: "cacheExpire"
      });
    }, 50000)
  }

  // Finds the next bus that will require updating of its time status
  // Eg if the time now is 00:01:01, and there is a bus arriving at 00:03:00
  // updates will need to be pushed at 00:02:00
  let allSeconds = [];
  const minNonNeg = arr => Math.min(...arr.map(a => a > -1 ? a : a + 60));
  for (let i = 0; i < busStops.length; i++) {
    for (const service of results[i]) {
      service.stopId = busStops[i]
      const bus1 = new Date(service.NextBus.EstimatedArrival)
      const bus2 = new Date(service.NextBus2.EstimatedArrival);
      allSeconds.push(bus1.getSeconds(), bus2.getSeconds())
      // Bus already come, shift buses behind forward
      if (bus2 < new Date().getTime()) {
        service.NextBus2 = service.NextBus3
        service.NextBus3 = {
          EstimatedArrival: new Date(0)
        }
      }
      if (bus1 < new Date().getTime()) {
        service.NextBus = service.NextBus2
        service.NextBus2 = service.NextBus3
        service.NextBus3 = {
          EstimatedArrival: new Date(0)
        }
      }
    }
  }
  allSeconds = allSeconds.map(a => a - new Date().getSeconds()).filter(a => !Number.isNaN(a));
  const seconds = minNonNeg(allSeconds) + 1;
  const time = parseTime(new Date(new Date().getTime() + seconds * 1000));
  setTimeout(() => {
    if (refreshCallback) refreshCallback({
      time,
      type: "timingReRender"
    });
  }, seconds * 1000);
  return {
    results
  }
}

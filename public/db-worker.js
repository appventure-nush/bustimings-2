importScripts("/dexie/dist/dexie.min.js");
importScripts("/promise-worker/dist/promise-worker.register.js");
const db = new Dexie("bus-data");
db.version(1).stores({
  busServices: "stopId"
})

registerPromiseWorker(function (message) {
  if(message.type=="set"){
    db.busServices.clear()
    const data = []
    for(const service of message.data){
      data.push({
        stopId:service[0].stopId,
        service
      })
    }
    return db.busServices.bulkPut(data)
  }else if(message.type=="get"){
    return new Promise((res,rej)=>{
      db.busServices.toArray()
      .then(services=>{
        services = services
        .map(({service})=>service)
        .sort((a,b)=>a.length-b.length)
        for(const service of services){
          for (const bus of service){
            if(new Date(bus.NextBus.EstimatedArrival)<new Date()){
              bus.NextBus = bus.NextBus2
              bus.NextBus2 = bus.NextBus3
            }
          }
        }
        return services
      })
    })
  }else if(message.type=="getStop"){
    return db.busServices.get(message.id)
  }
});
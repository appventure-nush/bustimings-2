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
    return db.busServices.toArray()
  }else if(message.type=="getStop"){
    return db.busServices.get(message.id)
  }
});
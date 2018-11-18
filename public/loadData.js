const database = new PromiseWorker(new Worker("/db-worker.js"))
const conn = io(location.origin,{
  secure: true,
  reconnectionDelay:100
});
conn.on("connect",function(){
  new Promise((res,rej)=>{
    conn.emit("dataReq",(err,data)=>{
      if(err) return rej(err)
      return res(data)
    })
  })
  .catch(async error=>{
    const json = await database.postMessage({
      type:"get"
    })
    document.getElementById("output").innerHTML = `
    <p class="error">
      Error loading data from server. Arrival times are estimated.<br>
      Last fetched: ${new Date().toLocaleTimeString()}
    </p>
    `
    document.getElementById("output").innerHTML += renderer(json)
    throw error
  })
  .then(async json =>{
    console.log(json)
    await database.postMessage({
      type:"set",
      data:json
    })
    return json
  })
  .then(json=>{
    document.getElementById("output").innerHTML = renderer(json)
  })


  // Server pushes data
  conn.on("data",async data=>{
    console.log("Data pushed:",data)
    await database.postMessage({
      type:"set",
      data
    })
    document.getElementById("output").innerHTML = renderer(data)
  })
})


// Refresh timings every 3 seconds
setInterval(async ()=>{
  console.log("Refreshed")
  const json = await database.postMessage({
    type:"get"
  })
  document.getElementById("output").innerHTML = renderer(json)
},3000)
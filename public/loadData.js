const database = new PromiseWorker(new Worker("/db-worker.js"))
fetch("/api/getData",{method:"POST"})
.then(res=>res.json())
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
  document.getElementById("output").innerHTML += renderer(json
    .map(({service})=>service)
    .sort((a,b)=>a.length-b.length)
  )
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
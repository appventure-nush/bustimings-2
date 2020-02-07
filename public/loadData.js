Sentry.init({ dsn: 'https://49b3a3016f6142528d355dc7042ef841@sentry.io/2322532' });

const updateTime = () => {
  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  const seconds = new Date().getSeconds();
  const time = (hours % 12).toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0') + (hours > 11 && hours !== 24 ? "pm" : "am");
  document.getElementById("time").innerText = time;
}
updateTime();
setInterval(updateTime, 500);
const database = new PromiseWorker(new Worker("/db-worker.js"))
const conn = io(location.origin, {
  secure: true,
  reconnectionDelay: 100,
  timeout: 3000
});
conn.on("connect", function () {
  new Promise((res, rej) => {
      conn.emit("dataReq", (err, data) => {
        if (err) return rej(err)
        return res(data)
      })
    })
    .catch(async error => {
      const json = await database.postMessage({
        type: "get"
      })
      document.getElementById("output").innerHTML = `
    <p class="error">
      Error loading data from server. Arrival times are estimated.<br>
      Last fetched: ${new Date(json[0].lastUpdated).toLocaleTimeString()}
    </p>
    `
      document.getElementById("output").innerHTML += renderer(json)
      throw error
    })
    .then(async json => {
      console.log(json)
      await database.postMessage({
        type: "set",
        data: json
      })
      return json
    })
    .then(json => {
      document.getElementById("output").innerHTML = renderer(json)
    })


  // Server pushes data
  conn.on("data", async data => {
    console.log("Data pushed:", data)
    await database.postMessage({
      type: "set",
      data
    })
    document.getElementById("output").innerHTML = renderer(data)
  })

  conn.on("reRender", async () => {
    const data = await database.postMessage({
      type: "get"
    })
    document.getElementById("output").innerHTML = renderer(data)
  })
})



conn.on("connect_error", async () => {
  console.log("Connection error")
  const json = await database.postMessage({
    type: "get"
  })
  console.log("Locally cached:", json)
  document.getElementById("output").innerHTML = `
  <p class="error">
    Error loading data from server. Arrival times are estimated.<br>
    Last fetched: ${new Date(json[0].lastUpdated).toLocaleTimeString()}
  </p>
  `
  document.getElementById("output").innerHTML += renderer(json)
})

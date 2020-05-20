Sentry.init({dsn: 'https://49b3a3016f6142528d355dc7042ef841@sentry.io/2322532'});

const updateTime = () => {
  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  const seconds = new Date().getSeconds();
  const time = (hours % 12).toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0') + (hours > 11 && hours !== 24 ? "pm" : "am");
  if (time === "08:44:12am") {
    // Refresh page daily
    location.reload()
  }
  document.getElementById("time").innerText = time;
}
updateTime();
setInterval(updateTime, 500);
const conn = io(location.origin, {
  secure: true,
  reconnectionDelay: 100,
  timeout: 3000,
  path: (location.pathname === "/" ? "" :location.pathname)  + "/socket.io"
});
conn.on("connect", function () {
  new Promise((res, rej) => {
    conn.emit("dataReq", (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
    .catch(async error => {
      const json = getCachedData();
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
      setCachedData(json)
      return json
    })
    .then(json => {
      document.getElementById("output").innerHTML = renderer(json)
    })


  // Server pushes data
  conn.on("data", async data => {
    console.log("Data pushed:", data);
    setCachedData(data);
    document.getElementById("output").innerHTML = renderer(data)
  })

  conn.on("reRender", async () => {
    const data = getCachedData();
    document.getElementById("output").innerHTML = renderer(data)
  })
})


conn.on("connect_error", async () => {
  console.log("Connection error")
  const json = getCachedData();
  console.log("Locally cached:", json)
  document.getElementById("output").innerHTML = `
  <p class="error">
    Error loading data from server. Arrival times are estimated.<br>
    Last fetched: ${new Date(json[0].lastUpdated).toLocaleTimeString()}
  </p>
  `
  document.getElementById("output").innerHTML += renderer(json)
})


function getCachedData() {
  const services = JSON.parse(localStorage.getItem("data"))
    .map(({service, lastUpdated}) => {
      service.lastUpdated = lastUpdated;
      return service
    })
    .sort((a, b) => a.length - b.length)
  for (const service of services) {
    for (const bus of service) {
      // If next bus already arrived, move buses forward
      if (new Date(bus.NextBus2.EstimatedArrival).getTime() < new Date().getTime()) {
        bus.NextBus2 = bus.NextBus3;
        bus.NextBus3 = {
          EstimatedArrival: new Date(0)
        }
      }
      if (new Date(bus.NextBus.EstimatedArrival).getTime() < new Date().getTime()) {
        bus.NextBus = bus.NextBus2;
        bus.NextBus2 = bus.NextBus3;
        bus.NextBus3 = {
          EstimatedArrival: new Date(0)
        }
      }
    }
  }
  return services
}

function setCachedData(services) {
  const data = [];
  for (const service of services) {
    if (service.length === 0) continue
    data.push({
      stopId: service[0].stopId,
      service,
      lastUpdated: new Date().getTime()
    })
  }
  localStorage.setItem("data", JSON.stringify(data));
}

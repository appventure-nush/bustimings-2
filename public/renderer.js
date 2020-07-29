function renderer(data) {
  let html = ""
  const busStops = {
    "16991": "Front Gate",
    "17191": "Back Gate",
    "17129": "Back Gate Middle",
    "17121": "Back Gate Far"
  }
  for (let stop of data) {
    stop = stop.filter(function ({ServiceNo}) {
      return ServiceNo !== "963R" && ServiceNo !== "97e";
    })
    if (stop.length > 3) {
      // Break into 2 columns
      const stopA = stop.slice(0, Math.ceil(stop.length / 2))
      const stopB = stop.slice(Math.ceil(stop.length / 2), stop.length)
      html += `
      <p class='stopName'>
        ${busStops[stop[0].stopId]}
      </p>`
      html += `
      <div class="float-left">
      <table class='stop'>`
      html += renderBusStop(stopA, busStops[stop[0].stopId])
      html += `</div>
      <div class="float-right">
      <table class='stop'>
      `
      html += renderBusStop(stopB, `<!-- Part B of ${busStops[stop[0].stopId]} -->`)
      html += "</div>"
    } else {
      html += `
      <p class='stopName'>
        ${busStops[stop[0].stopId]}
      </p>
      <table class='stop'>`
      html += renderBusStop(stop, busStops[stop[0].stopId])
    }
  }
  return html + "<br><br>"
}

function getMins(time) {
  const currTime = new Date()
  if (!time instanceof Date) {
    return "--";
  }
  if (time - currTime < 0) {
    return "No data"
  } else if (time - currTime > 60000) {
    return Math.floor((time - currTime) / 60000);
  } else if (time - currTime < 60000) {
    return "Arr";
  } else {
    return "--";
  }
}

function getLoadClass(load) {
  if (!load) {
    return "load-unknown";
  }
  return "load-" + load
}

function displayTiming(busNo, {Load: load, EstimatedArrival: arrival}, debug = false) {
  const arrivalMins = getMins(new Date(arrival))
  let html =
    `<td class='t1 ${arrivalMins === "No data" ? "no-data" : getLoadClass(load)}'>
      ${arrivalMins}`
  if (busNo) {
    html = `<td class='busNo'>${busNo}</td>` + html
  }
  if (arrivalMins != 'Arr' && arrivalMins !== 'No data' && arrivalMins !== '--') {
    html += "<span class='m'>m</span>";
  }
  return html +
    (debug
      ? `<div class="small">${new Date(arrival).toLocaleTimeString()}</div></td>`
      : `</td>`)
}

function renderBusStop(services) {
  const debug = location.search.includes("debug")
  let html = ``
  for (const service of services) {
    html += `<tr>
      ${displayTiming(service.ServiceNo, service.NextBus, debug)}
      ${displayTiming(null, service.NextBus2, debug)}
      </tr>
      `
  }
  return html + "</table>"
}

if(typeof navigator==="undefined"){
  module.exports =  renderer
}

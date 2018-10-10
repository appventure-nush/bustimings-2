const renderer = data =>{
  let html = ""
  const busStops = {
    "16991":"Front Gate", 
    "17191":"Back Gate", 
    "17129":"Back Gate Middle", 
    "17121":"Back Gate Far"
  }
  for(const stop of data){
    html+= renderBusStop(stop,busStops[stop[0].stopId])
  }
  return html + "<br><br>"
}
const getMins = time=> {
  const currTime = new Date()
  if (!time instanceof Date) {
    return "--";
  }
  if (time-currTime > 60000) {
    return Math.floor((time - currTime) / 60000);
  }else if (time-currTime < 60000) {
    return "Arr";
  } else {
    return "--";
  }
}
const getColor = load =>{
  if (!load) {
    return "LightCyan";
  }
  if (load == "SEA") {
    return "#99ff99";
  }
  if (load == "SDA") {
    return "#ffff99";
  }
  if (load == "LSD") {
    return "#ff9999";
  }
}

const displayTiming = (busNo,{Load:load,EstimatedArrival:arrival}) =>{
  let html =
   `<td class='t1' style=' background-color:${getColor(load)}'>
      ${getMins(new Date(arrival))}`
  if(busNo){
    html = `<td class='busNo'>${busNo}</td>` + html
  }
  if (getMins(new Date(arrival)) != 'Arr') {
    html += "<span class='m'>m</span>";
  } 
  return html + "</td>"
}

const renderBusStop = (services,stopName,showAll=false)=>{
  let html = `
    <p class='stopName' style='width:100%'>
      ${stopName}
    </p>
    <table class='stop' style='width:100%;'>`
  services = services.filter(({ServiceNo})=>ServiceNo!=="963R" && ServiceNo!=="97e")
  for(const service of services){
    console.log(service)
    html+=`<tr>
      ${displayTiming(service.ServiceNo,service.NextBus)}
      ${displayTiming(null,service.NextBus2)}
      </tr>
      `
  }
  return html + "</table>"
}
if(typeof navigator==="undefined"){
  module.exports =  renderer
}
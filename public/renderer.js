const renderer = data =>{
  let html = ""
  const busStops = {
    "16991":"Front Gate", 
    "17191":"Back Gate", 
    "17129":"Back Gate Middle", 
    "17121":"Back Gate Far"
  }
  for(const stop of data){
    if(stop.length>3){
      // Break into 2 columns
      const stopA = stop.slice(0,Math.ceil(stop.length/2))
      const stopB = stop.slice(Math.ceil(stop.length/2),stop.length)
      html+=`
      <p class='stopName'>
        ${busStops[stop[0].stopId]}
      </p>`
      html+=`
      <div class="float-left">
      <table class='stop'>`
      html+= renderBusStop(stopA,busStops[stop[0].stopId])
      html+=`</div>
      <div class="float-right">
      <table class='stop'>
      `
      html+= renderBusStop(stopB,`<!-- Part B of ${busStops[stop[0].stopId]} -->`)
      html+="</div>"
    }else{
      html+=`
      <p class='stopName'>
        ${busStops[stop[0].stopId]}
      </p>
      <table class='stop'>`
      html+= renderBusStop(stop,busStops[stop[0].stopId])
    }
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
const getLoadClass = load =>{
  if (!load) {
    return "load-unknown";
  }
  return "load-"+load
}

const displayTiming = (busNo,{Load:load,EstimatedArrival:arrival}) =>{
  let html =
   `<td class='t1 ${getLoadClass(load)}'>
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
  let html = ``
  services = showAll ? services : services.filter(({ServiceNo})=>ServiceNo!=="963R" && ServiceNo!=="97e")
  for(const service of services){
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
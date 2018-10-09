const renderer = data =>{
  let html = "<table border='1'; style='table-layout:fixed;width:100%;height:100%;border-collapse:collapse;'>"
  for(const stop of data){
    html+= renderBusStop(stop,stop.stopId)
  }
  html += "</table>"
  return html
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
const renderBusStop = ({services},stopName,showAll=false)=>{
  let html = `<tr><td rowspan='4' style='width:21%;padding:2%'>${stopName}</td></tr>`
  const currTime = new Date()
  const doNotShow = ['97e','963R']
  const timingsName = ["next","subsequent","next2"]
  for (const service of services){
    if(showAll || !doNotShow.includes(service.no)){
      //Not hidden
      for(const timingName of timingsName){
        const diff = new Date(new Date(service[timingName].time) - currTime).getMinutes()
        html += `<tr><td class='time' style='border-width: 0px 1px 0px 0px;background-color:"white" '>${diff}</td></tr>`
      }
    }
  }
  return html
}
if(typeof navigator==="undefined"){
  module.exports =  renderer
}
const renderer = data =>{
  let html = "<table border='1'; style='table-layout:fixed;width:100%;height:100%;border-collapse:collapse;'>"
  for(const stop of data){
    html+= renderBusStop(stop,stop.stopId)
  }
  html += "</table>"
  return html
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
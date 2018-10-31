fetch("/api/getData",{method:"POST"})
.then(res=>res.json())
.then(json=>{
  document.getElementById("output").innerHTML = renderer(json)
})
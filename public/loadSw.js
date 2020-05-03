if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', {scope: './'}).then
  (reg=>{
    console.log('Registration succeeded. Scope is ' + reg.scope)
  })
  .catch(function(error) {
    console.log('Registration failed with ' + error)
  })
  navigator.serviceWorker.ready.then(sw => sw.update())
}

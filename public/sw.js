//This is a service worker
//It handles caching and PWA
//Based on hwboard serviceWorker
//https://github.com/junron/hwboard/blob/master/public/sw.js
const version = "1.1.0"

console.log(`Service worker version ${version}`)
self.addEventListener('install', function(e) {
  console.log(`Installed service worker version ${version}`)
  e.waitUntil((async()=>{
    await self.skipWaiting()
    return caches.open('cache-default').then(function(cache) {
      const cacheArray = [
        "/index.min.css",
        "/index.html",
        "/loadData.js",
        "/renderer.js",
        "/loadSw.js"
      ]
      return cache.addAll(cacheArray);
    })
  })());
});

const createResponse = (data,headers) => new Response(
  data ? new Blob(data.data,{type:data.type}) : new Blob(),
  headers)

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
});
self.addEventListener('fetch',function(event) {
  if(event.request.method=="GET"){
    const {url} = event.request
    event.respondWith(
      caches.open('cache1').then(async function(cache) {
        return cache.match(event.request).then(function(response) {
          console.log(`Loading ${url}`)
          const fetchPromise = new Promise(resolve=>{
            const timer = url.includes("/socket.io") ? 10 : setTimeout(()=>{
              console.log(`Network timed out for ${url}`)
              resolve(createResponse({
                data:["<h1>Request timed out</h1><h2>Please try again later</h2>"],
                type:"text/html"
              },{
                status:500,
                statusText:"Request timed out"
              }))
            }, 3000)
            fetch(event.request)
            .then(response=>{
              clearTimeout(timer)
              resolve(response)
            })
          })
          .then(networkResponse=>{
            //Don't cache stuffs that change frequently
            if((!url.includes("?useCache")) &&
             url.includes("api/") ||
             url.includes("?noCache")){
              return networkResponse;
            }
            if(networkResponse.ok){
              //Request successful, add to cache
              cache.put(event.request, networkResponse.clone());
              console.log(`Cached ${url}`)
              return networkResponse
            //Something went wrong
            }else{
              console.log(`Failed to fetch from network ${url}: Error code ${networkResponse.status} ${networkResponse.statusText}`)
              if(!response){
                //Likely 404
                console.log("No cached response, returning errored response")
                return networkResponse
              }
              //Maybe server down
              return response
            }
          })
          .catch(e=>{
            console.log("An error occurred:",e)
            return response
          })
          return response || fetchPromise
        })
      })
    );
  }
});
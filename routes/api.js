const getData = require("../getData")
let currentRefreshId;

module.exports = (socket, io) => {
  const uncaughtErrorHandler = require("./error")(socket)

  const push = async id => {
    if (id.time === currentRefreshId) {
      console.log("Deduped:", id.time)
      return
    }
    if (io.connections > 0) {
      currentRefreshId = id.time;
      const {
        results
      } = await getData(push)
      if (id.type === "timingReRender") {
        io.emit('reRender');
        console.log("ReRender requested:", id.time)
        return
      }
      io.emit('data', results)
      console.log("New data:", id.time)
    }
  }
  getData(push);
  socket.on("dataReq", callback => {
    ;
    (async () => {
      const {
        results
      } = await getData();
      return callback(null, results)
    })()
    .catch(e => {
        console.log(e)
        throw e
      })
      .catch(e => callback(e.toString()))
      //Error in handling error
      .catch(uncaughtErrorHandler)
  })
}
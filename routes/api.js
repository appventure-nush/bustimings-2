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
      io.emit('data', results)
      console.log("Pushed:", id.time)
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
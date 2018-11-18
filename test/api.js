const chai = require("chai")
const mocha = require("mocha")
const {expect} = chai
const io = require('socket.io-client')
const websocket = require("../app").server
const port = process.env.BUSTIMINGS_PORT || 8081
let client
describe("Bustimings Websocket API",function(){
  this.timeout(10000)
  before(function(done){
    websocket.listen(port)
    setTimeout(()=>{
      console.log("http://localhost:" + port)
      client = io("http://localhost:" + port)
      client.on("disconnect",()=>{
        console.log("Disconnect")
      })
      client.on("error",console.log)
      client.on("connect",()=>{
        console.log("connected")
        done()
      },1000)
    })
  })
  after(function(done){
    websocket.close()
    done()
  })
  it("Should return valid data",done=>{
    //Get response data
    client.emit("dataReq",(err,response)=>{
      if(err) throw err
      expect(response).to.be.an("array")
      const [frontGate] = response
      //Frontgate data assertions
      expect(frontGate).to.be.an("array")
      expect(frontGate.length).to.equal(1)
  
      const [bus189] = frontGate
      expect(bus189).to.be.an("object")
  
      const {ServiceNo,Operator,stopId,NextBus} = bus189
      expect(ServiceNo).to.equal("189")
      expect(Operator).to.equal("TTS")
      expect(stopId).to.equal("16991")
      expect(NextBus).to.be.an("object")
      done()
    })
  })
})
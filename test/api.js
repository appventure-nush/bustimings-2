const mocha = require("mocha")
const {expect} = require("chai")
const app = require("../app")
const http = require('http')
const request = require("request-promise-native")

describe("Bustimings API",async function(){
  this.timeout(15000);
  before(async function (){
    this.timeout(40000)
    server = http.createServer(app);
    server.listen(8081)
  })
  it("Should return valid data",async function (){
    //Get response data
    const response = JSON.parse(await request.post(`http://localhost:8081/api/getData`))
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
  })
  it("Should not respond to GET requests",async function (){
    //Get response data
    try{
      await request.get(`http://localhost:8081/api/getData`)
    }catch(e){
      expect(e.statusCode).to.equal(404)
      return "ok"
    }
    throw new Error("API did not reject GET request")
  })
  after(async function(){
    server.close()
    return
  })
})
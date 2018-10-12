const puppeteer = require("puppeteer")
const mocha = require("mocha")
// const {expect} = require("chai")
const app = require("../app")
const http = require('http')
const options = {
  headless:false,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  //Slow down so you can see whats happening
  slowMo:10
}
if(process.env.TRAVIS){
  console.log("CI env")
  //No display in CI
  options.headless = true
}

let browser, page, server

async function init(){
  browser = await puppeteer.launch(options)
  console.log("browser launch")
  page = await browser.newPage()
  console.log("pageopen")
}

describe("Hwboard",async function(){
  this.timeout(15000);
  before(async function (){
    this.timeout(40000)
    server = http.createServer(app);
    server.listen(8081)
    await init()
  })
  it("Should display bus timings",async function (){
    await page.goto('http://localhost:8081')
    console.log("pageloaad")
    await page.screenshot({path: './artifacts/initial.png'})
    await page._client.send('Emulation.clearDeviceMetricsOverride')
    console.log("Browser + page ready")
  })
  after(async function(){
    await browser.close()
    server.close()
    return
  })
})
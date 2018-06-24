const gulp = require('gulp')
const {Builder, By} = require('selenium-webdriver')
const cp = require('child_process')
async function openPage() {
    let driver = await new Builder().forBrowser('chrome').build()
    try {
      await driver.get('http://localhost:8000')
      for (var i = 0; i < 20; i++) {
          await driver.findElement(By.js(() => {

              return document.getElementsByTagName('canvas')[0]
          })).click()
          await driver.sleep(1000)
      }
      await driver.sleep(2000)
    }  finally {
        await driver.quit()
    }
}
gulp.task('default', () => {
    console.log('starting the server')
    const startServerProcess = cp.spawn('python', ['-m', 'SimpleHTTPServer'], {stdio:'pipe'})

    startServerProcess.stdout.on('data', (data) => {
        console.log(data)
    })

    startServerProcess.stderr.on('data', (data) => {
        console.log(data.toString())
    })

    startServerProcess.on('error', () => {
        console.log("error starting the server")
    })

    setTimeout(() => {
        console.log("server connected on port 8000")
        async function start() {
            await openPage()
            startServerProcess.kill()
        }
        start()
    }, 1000)


})

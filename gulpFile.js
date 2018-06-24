const gulp = require('gulp')
const {Builder, By} = require('selenium-webdriver')
const cp = require('cp')
async function openPage() {
    let driver = await new Builder().forBrowser('chrome').build()
    try {
      await driver.get('http://localhost:8000')
      for (var i = 0; i < 10; i++) {
          await driver.findElement(By.tagName('canvas').click())
          await driver.wait(() => false, 500)
      }
    }  finally {
        await driver.quit()
    }
}
gulp.task('default', () => {
    cp.exec('python -m SimpleHTTPServer',(err, stdout, stderr) => {
        if (err == null) {
            console.log(stdout)
            await openPage()
        }
    })
})

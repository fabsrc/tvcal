const express = require('express')
const path = require('path')
const tvcal = require('./lib/tvcal')
const app = express()

function getAirDates (req, res) {
  let query = req.params.id || req.query.q

  if (!query) return res.send('No Query or ID given!')

  tvcal({
    domain: req.headers.host,
    showIds: req.params.id ? query.split(';') : false,
    showTitles: req.query.q ? query.split(';') : false,
    filterDate: new Date(new Date() - 14 * 24 * 60 * 60 * 1000)
  })
  .catch(err => {
    console.error(err)
    res.status(404).send('Shows not found!')
  })
  .then(cal => {
    if (cal) {
      return (process.env.NODE_ENV === 'development') ? res.send(cal.toString()) : cal.serve(res)
    }
  })
}

app.get('/shows/:id?', getAirDates)
app.use(express.static(path.resolve('public')))
app.use((req, res, next) => res.sendFile(path.resolve('views/index.html')))

app.listen(5000, function () {
  console.log('TVCal listening on port', this.address().port)
})

module.exports = app

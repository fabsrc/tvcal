const express = require('express')
const path = require('path')
const tvcal = require('./lib/tvcal')
const app = express()

function getAirDates (req, res, next) {
  let query = req.params.id || req.query.q

  if (!query) return res.send('No Query or ID given!')

  tvcal({
    domain: req.headers.host,
    showIds: req.params.id ? query.split(';') : false,
    showTitles: req.query.q ? query.split(';') : false,
    filterDate: new Date(new Date() - 14 * 24 * 60 * 60 * 1000)
  })
  .then(cal => process.env.NODE_ENV === 'development' ? res.send(cal.toString()) : cal.serve(res))
  .catch(next)
}

app.use(express.static(path.resolve('public')))
app.get('/', (req, res, next) => res.sendFile(path.resolve('views/index.html')))
app.get('/shows/:id?', getAirDates)
app.use((req, res, next) => res.redirect('/', 404))
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.error(err)

  if (err.statusCode === 404) {
    res.status(404).send(`Show not found (${err.options.url})`)
  } else {
    res.status(500).send('Server Error')
  }
})

app.listen(process.env.PORT || 5000, function () {
  console.log('TVCal listening on port', this.address().port)
})

module.exports = app

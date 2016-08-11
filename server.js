const ical = require('ical-generator')
const tvmaze = require('./lib/tvmaze')
const express = require('express')
const path = require('path')
const pad = require('./lib/pad')
const app = express()

function getAirDates (req, res) {
  let query = req.params.id || req.query.q

  if (!query) return res.send('No Query or ID given!')

  let cal = ical({
    name: 'TVCal',
    domain: req.headers.host,
    prodId: '//' + req.headers.host + '//TVCal//EN'
  })

  let showsAndEpisodes = query.split(';').map(s => req.params.id ? tvmaze.getShow(s) : tvmaze.findSingleShow(s))

  Promise.all(showsAndEpisodes).then(shows => {
    shows.forEach(show => {
      let episodes = show._embedded && show._embedded.episodes || null

      if (!episodes || show.status !== 'Running') return

      episodes.filter(episode => {
        // display no episodes older than two weeks
        return new Date(episode.airstamp) >= new Date(new Date() - 14 * 24 * 60 * 60 * 1000)
      })
        .forEach(episode => {
          cal.createEvent({
            start: new Date(episode.airstamp),
            end: new Date(new Date(episode.airstamp).getTime() + episode.runtime * 60 * 1000),
            summary: show.name + ' [S' + pad(episode.season) + 'E' + pad(episode.number) + ']',
            description: episode.name,
            url: episode.url
          })
        })
    })

    return (process.env.NODE_ENV === 'development') ? res.send(cal.toString()) : cal.serve(res)
  }).catch(err => {
    console.error(err)
    res.status(404).send('Shows not found!')
  })
}

app.get('/shows/:id?', getAirDates)
app.use(express.static(path.resolve('public')))
app.use((req, res, next) => res.sendFile(path.resolve('views/index.html')))

app.listen(5000, function () {
  console.log('TVCal listening on port', this.address().port)
})

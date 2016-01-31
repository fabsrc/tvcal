'use strict'

const app     = require('express')()
const ical    = require('ical-generator')
const tvmaze  = require('./tvmaze')


Number.prototype.pad = function(size) {
  let s = String(this)
  while (s.length < (size || 2)) { s = '0' + s }
  return s
}

function getAirDates(req, res) {
  let cal = ical()

  cal.name('TVCal')
  cal.domain('tvcal.retromediation.net')
  cal.prodId('//tvcal.retromediation.net//TVCal//EN')

  let query = req.params.id || req.query.q

  if (!query) {
    return res.send('No Query or ID given!')
  }

  let series = query.split(';')
  let seriesAndEpisodes = series.map( (s) => {
    let showName

    return tvmaze.findOrGetShow(s)
      .then( (show) => {
        if (show.status !== 'Running')
          return

        showName = show.name

        return tvmaze.getEpisodes(show.id)
      })
      .then( (episodes) => {
        if (!episodes)
          return

        return episodes.filter( (episode) => {
          return new Date(episode.airstamp) >= new Date()
        }).forEach( (episode) => {
          cal.createEvent({
            start: new Date(episode.airstamp),
            end: new Date(new Date(episode.airstamp).getTime() + episode.runtime*60*1000),
            summary: showName + ' [S' + episode.season.pad() + 'E' + episode.number.pad() + ']',
            description: episode.name + '\n' + episode.url
          })
        })
      })
  })

  Promise.all(seriesAndEpisodes).then( () => {
    cal.serve(res)
    // res.send(cal.toString())
  })
}

app.get('/shows/:id', getAirDates)
app.get('/shows/', getAirDates)
app.get('/*', (req, res) => res.send(''))

app.listen(5000, console.log('TVCal listening on port 5000!'))
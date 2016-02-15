'use strict'

const ical    = require('ical-generator')
const tvmaze  = require('./tvmaze')
const express = require('express')
const app     = express()

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

  let shows = query.split(';')
  let showsAndEpisodes = req.params.id ?
    shows.map( s => tvmaze.getShow(s) ) :
    shows.map( s => tvmaze.findSingleShow(s) )

  Promise.all(showsAndEpisodes).then( shows => {
    shows.forEach( show => {
      let episodes = show._embedded && show._embedded.episodes || null

      if (!episodes || show.status !== 'Running')
        return

      episodes.filter( episode => {
        return new Date(episode.airstamp) >= new Date(new Date() - 14*24*60*60*1000)
      })
      .forEach( episode => {
        cal.createEvent({
          start: new Date(episode.airstamp),
          end: new Date(new Date(episode.airstamp).getTime() + episode.runtime*60*1000),
          summary: show.name + ' [S' + episode.season.pad() + 'E' + episode.number.pad() + ']',
          description: episode.name,
          url: episode.url
        })
      })
    })

    // res.send(cal.toString())
    cal.serve(res)
  }).catch( err => {
    console.error(err)
    res.status(404).send('Shows not found!')
  })
}

app.get('/shows/:id', getAirDates)
app.get('/shows/', getAirDates)
app.use(express.static(__dirname + '/public'))
app.use((req, res, next) => res.sendFile(__dirname + '/views/index.html'))

app.listen(5000, console.log('TVCal listening on port 5000!'))

'use strict'

let app     = require('express')()
let ical    = require('ical-generator')
let request = require('request-promise')

Number.prototype.pad = function(size) {
  let s = String(this)
  while (s.length < (size || 2)) { s = '0' + s }
  return s
}

app.get('/shows/:id', (req, res) => {
  let cal = ical()
  cal.name('TVCal')
  cal.domain('tvcal.retromediation.net')
  cal.prodId('//tvcal.retromediation.net//TVCal//EN')

  let query = req.params.id
  if (!query) {
    return res.send('No ID given!')
  }

  let series = query.split(';')
  let seriesAndEpisodes = series.map( (s) => {
    let showName

    return request({ url: 'http://api.tvmaze.com/shows/' + s, json: true })
      .then( (show) => {
        if (show.status !== 'Running')
          return

        showName = show.name

        return request({ url: 'http://api.tvmaze.com/shows/' + show.id + '/episodes', json: true })
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
})

app.get('/shows/', (req, res) => {
  let cal = ical()
  cal.name('TVCal')
  cal.domain('tvcal.retromediation.net')
  cal.prodId('//tvcal.retromediation.net//TVCal//EN')

  let query = req.query.q
  if (!query) {
    return res.send('No Query!')
  }

  let series = query.split(';')

  let seriesAndEpisodes = series.map((s) => {
    let showName

    return request({ url: 'http://api.tvmaze.com/singlesearch/shows/?q=' + s, json: true })
      .then( (show) => {
        if (show.status !== 'Running')
          return

        showName = show.name

        return request({ url: 'http://api.tvmaze.com/shows/' + show.id + '/episodes', json: true })
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

})

app.get('/*', (req, res) => {
  res.send('')
})

app.listen(5000, () => {
  console.log('TVCal listening on port 5000!')
})
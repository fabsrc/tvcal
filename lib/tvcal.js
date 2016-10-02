const querystring = require('querystring')
const ical = require('ical-generator')
const tvmaze = require('./tvmaze')
const pad = require('./pad')

module.exports = function tvcal (options) {
  let cal = ical({
    name: options.name || 'TVCal',
    domain: options.domain || 'TVCal',
    prodId: '//' + (options.domain || 'TVCal') + '//TVCal//EN'
  })

  if (!options.showIds && !options.showTitles) {
    throw new Error('showIds or showTitles not defined.')
  }

  let showsAndEpisodes = options.showIds
    ? options.showIds.map(s => tvmaze.getShow(s))
    : options.showTitles.map(s => querystring.escape(s)).map(s => tvmaze.findSingleShow(s))

  return Promise.all(showsAndEpisodes)
    .then(shows => {
      shows.forEach(show => {
        let episodes = show._embedded && show._embedded.episodes || null

        if (!episodes || show.status !== 'Running') return

        episodes.filter(episode => new Date(episode.airstamp) >= (options.filterDate || new Date(0)))
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
    })
    .then(() => cal)
}

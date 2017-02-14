const querystring = require('querystring')
const ical = require('ical-generator')
const tvmaze = require('./tvmaze')
const pad = require('./pad')

module.exports = function tvcal (options = {}) {
  if (!options.showIds && !options.showTitles) {
    throw new Error('showIds or showTitles not defined.')
  }

  const cal = ical({
    name: options.name || 'TVCal',
    domain: options.domain || 'TVCal',
    prodId: '//' + (options.domain || 'TVCal') + '//TVCal//EN'
  })

  const showsAndEpisodes = options.showIds
    ? options.showIds.map(s => tvmaze.getShow(s))
    : options.showTitles.map(s => querystring.escape(s)).map(s => tvmaze.findSingleShow(s))

  return Promise.all(showsAndEpisodes)
    .then(shows => {
      shows.forEach(show => {
        let episodes = show._embedded && show._embedded.episodes || null

        if (!episodes || show.status !== 'Running') return

        episodes.filter(episode => new Date(episode.airstamp) >= (options.filterDate || new Date(0)))
          .forEach(episode => {
            let event = cal.createEvent({
              start: new Date(episode.airstamp),
              end: new Date(new Date(episode.airstamp).getTime() + episode.runtime * 60 * 1000),
              summary: show.name + ' [S' + pad(episode.season) + 'E' + pad(episode.number) + ']',
              description: episode.name,
              url: episode.url
            })

            if (options.alarm) {
              let offset = options.alarm.offset ? options.alarm.offset * 1000 : 0

              event.createAlarm({
                type: 'display',
                trigger: new Date(new Date(episode.airstamp).getTime() + offset)
              })
            }
          })
      })
    })
    .then(() => cal)
}

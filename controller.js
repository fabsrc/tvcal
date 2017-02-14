const Nedb = require('nedb')
const shortid = require('shortid')
const apicache = require('apicache')
const tvcal = require('./lib/tvcal')
const db = new Nedb({ filename: 'data/lists.db', autoload: true })

module.exports = class Controller {
  static getAirDates (req, res, next) {
    if (!req.params.ids && !req.query.q) return res.status(406).send('No Query or ID given!')

    tvcal({
      domain: req.headers.host,
      showIds: req.params.ids ? req.params.ids.split(';') : false,
      showTitles: req.query.q ? req.query.q.split(';') : false,
      filterDate: new Date(new Date() - 14 * 24 * 60 * 60 * 1000),
      alarm: req.query.alarm ? { offset: -300 } : false
    })
    .then(cal => process.env.NODE_ENV === 'development' ? res.send(cal.toString()) : cal.serve(res))
    .catch(next)
  }

  static createList (req, res, next) {
    db.insert(
      {
        _id: shortid.generate(),
        list: req.body
      },
      (err, doc) => {
        if (err) return next(err)

        return res.status(201).send(doc)
      }
    )
  }

  static updateList (req, res, next) {
    db.update(
      { _id: req.params.id },
      {
        _id: req.params.id,
        list: req.body
      },
      (err) => {
        if (err) return next(err)

        apicache.clear(req.originalUrl)
        return res.sendStatus(200)
      }
    )
  }

  static getList (req, res, next) {
    db.findOne(
      { _id: req.params.id },
      (err, doc) => {
        if (err) return next(err)

        if (!doc) {
          console.error(`List '${req.params.id}' not found!`)
          return res.status(404).send(`List '${req.params.id}' not found!`)
        }

        if (req.xhr || req.query.raw === 'true') return res.send(doc)

        req.params.ids = doc.list
        return Controller.getAirDates(req, res, next)
      }
    )
  }

  static deleteList (req, res, next) {
    db.remove({ _id: req.params.id }, {}, (err) => {
      if (err) return next(err)

      apicache.clear(req.originalUrl)
      return res.sendStatus(204)
    })
  }

  static errorHandler (err, req, res, next) {
    console.error(err)

    if (err.statusCode === 404) {
      res.status(404).send(`Shows not found (${err.options.url})`)
    } else {
      res.status(500).send('Server Error')
    }
  }
}

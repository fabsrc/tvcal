process.env.NODE_ENV = 'test'

const test = require('ava')
const nock = require('nock')
const request = require('supertest')
const MockDate = require('mockdate')
const app = require('./server')
const tvcal = require('./lib/tvcal')

test.before(t => {
  const response = {
    'id': 1871,
    'name': 'Mr. Robot',
    'status': 'Running',
    '_embedded': {
      'episodes': [
        {
          'id': 157154,
          'url': 'http://www.tvmaze.com/episodes/157154/mr-robot-1x01-eps10hellofriendmov',
          'name': 'eps1.0_hellofriend.mov',
          'season': 1,
          'number': 1,
          'airstamp': '2015-06-24T22:00:00-04:00',
          'runtime': 60
        }
      ]
    }
  }

  nock('http://api.tvmaze.com')
    .persist()
    .get('/shows/1871?embed=episodes')
    .reply(200, response)
    .persist()
    .get('/singlesearch/shows/?q=Mr%20Robot&embed=episodes')
    .reply(200, response)
    .persist()
    .get('/shows/0?embed=episodes')
    .reply(404, {
      'name': 'Not Found',
      'message': '',
      'code': 0,
      'status': 404
    })
    .persist()
    .get('/singlesearch/shows/?q=YYYY&embed=episodes')
    .reply(404)
})

test.cb('successful ical generation with id', t => {
  tvcal({
    domain: 'TestTVCal',
    showIds: [1871]
  })
  .then(cal => {
    t.truthy(cal)
    t.is((cal.toString().match(/BEGIN:VEVENT/g) || []).length, 1)
    t.end()
  })
})

test.cb('successful ical generation with title', t => {
  tvcal({
    domain: 'TestTVCal',
    showTitles: ['Mr Robot']
  })
  .then(cal => {
    t.truthy(cal)
    t.is((cal.toString().match(/BEGIN:VEVENT/g) || []).length, 1)
    t.end()
  })
})

test.cb('unsuccessful ical generation with wrong id', t => {
  tvcal({
    domain: 'TestTVCal',
    showIds: [0]
  })
  .catch(err => {
    t.is(err.statusCode, 404)
    t.end()
  })
})

test.cb('unsuccessful ical generation with wrong title', t => {
  tvcal({
    domain: 'TestTVCal',
    showTitles: ['YYYY']
  })
  .catch(err => {
    t.is(err.statusCode, 404)
    t.end()
  })
})

test.serial.cb('successful ical generation with id via endpoint with filtered episodes', t => {
  request(app)
    .get('/shows/1871')
    .end((err, res) => {
      t.falsy(err)
      t.is(res.status, 200)
      t.truthy(res.text)
      t.is((res.text.match(/BEGIN:VEVENT/g) || []).length, 0)
      t.end()
    })
})

test.serial.cb('successful ical generation with id via endpoint', t => {
  MockDate.set('2015-06-24T22:00:00-04:00')

  request(app)
    .get('/shows/1871')
    .end((err, res) => {
      t.falsy(err)
      t.is(res.status, 200)
      t.truthy(res.text)
      t.is((res.text.match(/BEGIN:VEVENT/g) || []).length, 1)
      MockDate.reset()
      t.end()
    })
})

test.serial.cb('successful ical generation with title via endpoint', t => {
  MockDate.set('2015-06-24T22:00:00-04:00')

  request(app)
    .get('/shows?q=Mr Robot')
    .end((err, res) => {
      t.falsy(err)
      t.is(res.status, 200)
      t.truthy(res.text)
      t.is((res.text.match(/BEGIN:VEVENT/g) || []).length, 1)
      MockDate.reset()
      t.end()
    })
})

test.cb('unsuccessful ical generation with wrong id via endpoint', t => {
  request(app)
    .get('/shows/0')
    .end((err, res) => {
      t.falsy(err)
      t.is(res.status, 404)
      t.regex(res.text, /Show not found/)
      t.end()
    })
})

test.cb('unsuccessful ical generation with wrong title via endpoint', t => {
  request(app)
    .get('/shows?q=YYYY')
    .end((err, res) => {
      t.falsy(err)
      t.is(res.status, 404)
      t.regex(res.text, /Show not found/)
      t.end()
    })
})

test.cb('web app delivery', t => {
  request(app)
    .get('/')
    .end((err, res) => {
      t.falsy(err)
      t.is(res.status, 200)
      t.end()
    })
})

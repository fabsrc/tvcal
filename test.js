const test = require('ava')
const nock = require('nock')
const request = require('supertest')
const MockDate = require('mockdate')
const app = require('./server')

test.cb('successful ical generation', t => {
  MockDate.set('2015-06-24T22:00:00-04:00')

  nock('http://api.tvmaze.com/')
    .get('/shows/1871?embed=episodes')
    .reply(200, {
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
    })

  request(app)
    .get('/shows/1871')
    .end((err, res) => {
      t.falsy(err)
      t.is(res.status, 200)
      t.truthy(res.text)
      t.true((res.text.match(/BEGIN:VEVENT/g) || []).length === 1)
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

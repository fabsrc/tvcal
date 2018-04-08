process.env.NODE_ENV = 'test'
console.error = () => {}

const test = require('ava')
const nock = require('nock')
const Nedb = require('nedb')
const sinon = require('sinon')
const request = require('supertest')
const MockDate = require('mockdate')
const apicache = require('apicache')
const proxyquire = require('proxyquire')
const controller = proxyquire('./controller', { nedb: class { constructor () { return new Nedb() }} })
const app = proxyquire('./server', { controller })
const tvcal = require('./lib/tvcal')

let sandbox
let testData = {}

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

test.beforeEach(t => {
  sandbox = sinon.sandbox.create()
})

test('[unit] (tvcal) ical generation using id parameter', function hello (t) {
  return tvcal({
    domain: 'TestTVCal',
    showIds: [1871]
  })
    .then(cal => {
      t.truthy(cal, 'returns something')
      t.is((cal.toString().match(/BEGIN:VEVENT/g) || []).length, 1, 'returns an ical')
    })
    .catch(t.falsy)
})

test('[unit] (tvcal) ical generation using title parameter', t => {
  return tvcal({
    domain: 'TestTVCal',
    showTitles: ['Mr Robot']
  })
    .then(cal => {
      t.truthy(cal, 'returns something')
      t.is((cal.toString().match(/BEGIN:VEVENT/g) || []).length, 1, 'returns an ical')
    })
    .catch(t.falsy)
})

test('[unit] (tvcal) ical generation with alarm', t => {
  return tvcal({
    domain: 'TestTVCal',
    showIds: [1871],
    alarm: true
  })
    .then(cal => {
      t.truthy(cal, 'returns something')
      t.is((cal.toString().match(/BEGIN:VEVENT/g) || []).length, 1, 'returns an ical')
      t.is((cal.toString().match(/BEGIN:VALARM/g) || []).length, 1, 'returns an alarm')
      t.regex(cal.toString(), /TRIGGER;VALUE=DATE-TIME:20150625T020000Z/, 'returns an alarm with no offset')
    })
    .catch(t.falsy)
})

test('[unit] (tvcal) ical genration with alarm with defined offset', t => {
  return tvcal({
    domain: 'TestTVCal',
    showIds: [1871],
    alarm: { offset: -300 }
  })
    .then(cal => {
      t.truthy(cal, 'returns something')
      t.is((cal.toString().match(/BEGIN:VEVENT/g) || []).length, 1, 'returns an ical')
      t.is((cal.toString().match(/BEGIN:VALARM/g) || []).length, 1, 'returns an alarm')
      t.regex(cal.toString(), /TRIGGER;VALUE=DATE-TIME:20150625T015500Z/, 'returns an alarm with an offset')
    })
    .catch(t.falsy)
})

test('[unit] (tvcal) ical generation with wrong id', t => {
  return tvcal({
    domain: 'TestTVCal',
    showIds: [0]
  })
    .then(t.falsy)
    .catch(err => {
      t.is(err.statusCode, 404, 'returns 404 status')
    })
})

test('[unit] (tvcal) ical generation with wrong title', t => {
  return tvcal({
    domain: 'TestTVCal',
    showTitles: ['YYYY']
  })
    .then(t.falsy)
    .catch(err => {
      t.is(err.statusCode, 404, 'returns 404 status')
    })
})

test('[unit] (tvcal) ical generation without title or id', t => {
  const err = t.throws(() => tvcal(), Error, 'throws an error')
  t.is(err.message, 'showIds or showTitles not defined.', 'returns an error message')
})

test('[unit] (controller) createList()', t => {
  sandbox.stub(Nedb.prototype, 'insert').returns(null)

  controller.createList({}, {}, {})
  t.true(Nedb.prototype.insert.called, 'calls db.insert')
})

test('[unit] (controller) updateList()', t => {
  sandbox.stub(Nedb.prototype, 'update').returns(null)

  controller.updateList({ params: {} }, {}, {})
  t.true(Nedb.prototype.update.called, 'calls db.update')
})

test('[unit] (controller) getList()', t => {
  sandbox.stub(Nedb.prototype, 'findOne').returns(null)

  controller.getList({ params: {} }, {}, {})
  t.true(Nedb.prototype.findOne.called, 'calls db.findOne')
})

test.serial('[integration] (app) GET /shows/:id', t => {
  return request(app)
    .get('/shows/1871')
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
      t.truthy(res.text, 'returns text')
      t.is((res.text.match(/BEGIN:VCALENDAR/g) || []).length, 1, 'returns an ical')
      t.is((res.text.match(/BEGIN:VEVENT/g) || []).length, 0, 'returns a filtered ical')
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) GET /shows/:id with mocked date', t => {
  MockDate.set('2015-06-24T22:00:00-04:00')

  return request(app)
    .get('/shows/1871')
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
      t.truthy(res.text, 'returns text')
      t.is((res.text.match(/BEGIN:VEVENT/g) || []).length, 1, 'returns ical with events')
      MockDate.reset()
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) GET /shows?q=:query', t => {
  MockDate.set('2015-06-24T22:00:00-04:00')

  return request(app)
    .get('/shows?q=Mr Robot')
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
      t.truthy(res.text, 'returns text')
      t.is((res.text.match(/BEGIN:VEVENT/g) || []).length, 1, 'returns ical with events')
      MockDate.reset()
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) GET /shows/:id=alarm=true', t => {
  MockDate.set('2015-06-24T22:00:00-04:00')

  return request(app)
    .get('/shows/1871?alarm=true')
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
      t.truthy(res.text, 'returns text')
      t.is((res.text.match(/BEGIN:VEVENT/g) || []).length, 1, 'returns an ical')
      t.is((res.text.match(/BEGIN:VALARM/g) || []).length, 1, 'returns an alarm')
      t.regex(res.text, /TRIGGER;VALUE=DATE-TIME:20150625T015500Z/, 'returns an alarm with offset')
      MockDate.reset()
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) POST /lists/', t => {
  return request(app)
    .post('/lists/')
    .set('Content-Type', 'text/plain')
    .send('1871')
    .then(res => {
      t.is(res.status, 201, 'returns 201 status')
      t.regex(res.text, /"list":"1871"/, 'returns text with sent id')
      testData._id = JSON.parse(res.text)._id
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) GET /lists/:id', t => {
  return request(app)
    .get(`/lists/${testData._id}`)
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
      t.is((res.text.match(/BEGIN:VCALENDAR/g) || []).length, 1, 'returns an ical')
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) GET /lists/:id?raw=true', t => {
  return request(app)
    .get(`/lists/${testData._id}?raw=true`)
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
      t.regex(res.text, /"list":"1871"/, 'returns raw list including saved id')
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) PUT /lists/:id', t => {
  return request(app)
    .put(`/lists/${testData._id}`)
    .set('Content-Type', 'text/plain')
    .send('9999')
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
    })
    .catch(t.falsy)
})

test.serial('[integration] (app) DELETE /lists/:id', t => {
  return request(app)
    .delete(`/lists/${testData._id}`)
    .then(res => {
      t.is(res.status, 204, 'returns 204 status')
    })
    .catch(t.falsy)
})

test('[integration] (app) GET /shows/:id with wrong id', t => {
  return request(app)
    .get('/shows/0')
    .then((res) => {
      t.is(res.status, 404, 'returns 404 status')
      t.regex(res.text, /Shows not found/, 'returns error message')
    })
    .catch(t.falsy)
})

test('[integration] (app) GET /shows?q=:query with wrong title', t => {
  return request(app)
    .get('/shows?q=YYYY')
    .then(res => {
      t.is(res.status, 404, 'returns 404 status')
      t.regex(res.text, /Shows not found/, 'returns error message')
    })
    .catch(t.falsy)
})

test('[integration] (app) GET /lists/:id with wrong list id', t => {
  return request(app)
    .get('/lists/999999')
    .then(res => {
      t.is(res.status, 404, 'returns 404 status')
      t.regex(res.text, /List '999999' not found!/, 'returns error message')
    })
    .catch(t.falsy)
})

test('[integration] (app) GET /shows/ without query or id', t => {
  return request(app)
    .get('/shows')
    .then(res => {
      t.is(res.status, 406, 'returns 406 status')
      t.regex(res.text, /No Query or ID given!/, 'returns error message')
    })
    .catch(t.falsy)
})

test('[integration] (app) GET /', t => {
  return request(app)
    .get('/')
    .then(res => {
      t.is(res.status, 200, 'returns 200 status')
    })
    .catch(t.falsy)
})

test.afterEach(t => {
  sandbox.restore()
  apicache.clear()
})

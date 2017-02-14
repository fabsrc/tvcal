const cache = require('apicache').middleware
const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const controller = require('./controller')
const app = module.exports = express()

app.use(express.static('public'))
app.use(bodyParser.text())
app.get('/', (req, res, next) => res.sendFile(path.resolve('views/index.html')))
app.get('/shows/:ids?', cache('5 hours'), controller.getAirDates)
app.post('/lists/', controller.createList)
app.get('/lists/:id', cache('5 hours'), controller.getList)
app.put('/lists/:id', controller.updateList)
app.delete('/lists/:id', controller.deleteList)
app.use((req, res, next) => res.redirect(404, '/'))
app.use(controller.errorHandler)

!module.parent && app.listen(process.env.PORT || 5000, function () {
  console.log('TVCal listening on port', this.address().port)
})

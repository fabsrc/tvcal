const request = require('request-promise')

class TVMaze {

  constructor () {
    this.APIURL = 'http://api.tvmaze.com/'
  }

  findSingleShow (searchString) {
    return request({ url: this.APIURL + `singlesearch/shows/?q=${searchString}&embed=episodes`, json: true })
  }

  getShow (id) {
    return request({ url: this.APIURL + `shows/${id}?embed=episodes`, json: true })
  }

}

module.exports = new TVMaze()

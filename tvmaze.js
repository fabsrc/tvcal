'use strict'

const request = require('request-promise')


class TVMaze {

  constructor() {
    this.APIURL = 'http://api.tvmaze.com/'
  }


  findOrGetShow(param) {
    if (typeof param == 'string') {
      return this.findSingleShow(param)
    } else if (typeof param == 'number') {
      return this.getShow(param)
    } else {
      return
    }
  }


  findSingleShow(searchString) {
    return request({ url: this.APIURL + 'singlesearch/shows/?q=' + searchString, json:true });
  }


  getShow(id) {
    return request({ url: this.APIURL + 'shows/' + id, json:true });
  }


  getEpisodes(id) {
    return request({ url: this.APIURL + 'shows/' + id + '/episodes', json:true })
  }

}

module.exports = new TVMaze()
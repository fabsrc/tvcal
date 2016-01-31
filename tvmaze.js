'use strict'

const request = require('request-promise')

class TVMaze {

  constructor() {
    this.APIURL = 'http://api.tvmaze.com/'
  }

  findOrGetShowAndEpisodes(param) {
    if (typeof param === 'string') {
      return this.findSingleShowAndEpisodes(param)
    } else if (typeof param === 'number') {
      return this.getShowAndEpisodes(param)
    } else {
      return
    }
  }

  findSingleShowAndEpisodes(searchString) {
    return request({ url: this.APIURL + 'singlesearch/shows/?q=' + searchString + '&embed=episodes', json:true });
  }

  getShowAndEpisodes(id) {
    return request({ url: this.APIURL + 'shows/' + id + '?embed=episodes', json:true });
  }

}

module.exports = new TVMaze()

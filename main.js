var express = require('express');
var ical    = require('ical-generator');
var request = require('request-promise');

var app = express();

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) { s = "0" + s; }
  return s;
};

app.get('/shows/:id', function (req, res) {
  var cal = ical();
  cal.name('TVCal');
  cal.domain('tvcal.retromediation.net');
  cal.prodId('//tvcal.retromediation.net//TVCal//EN');

  var query = req.params.id;
  if (!query) {
    return res.send('No ID given!');
  }

  var series = query.split(';');

  seriesAndEpisodes = series.map(function (s) {
    var showName;

    return request({ url: 'http://api.tvmaze.com/shows/' + s, json: true })
      .then(function(show) {
        if (show.status !== 'Running')
          return;

        showName = show.name;

        return request({ url: 'http://api.tvmaze.com/shows/' + show.id + '/episodes', json: true });
      })
      .then(function(episodes) {
        if (!episodes)
          return;

        return episodes.filter(function (episode) {
          return new Date(episode.airstamp) >= new Date();
        }).forEach(function(episode) {
          cal.createEvent({
            start: new Date(episode.airstamp),
            end: new Date(new Date(episode.airstamp).getTime() + episode.runtime*60*1000),
            summary: showName + ' [S' + episode.season.pad() + 'E' + episode.number.pad() + ']',
            description: episode.name + '\n' + episode.url
          });
        });
      });
  });

  Promise.all(seriesAndEpisodes).then(function () {
    cal.serve(res);
    // res.send(cal.toString());
  });
});

app.get('/shows/', function (req, res) {
  var cal = ical();
  cal.name('TVCal');
  cal.domain('tvcal.retromediation.net');
  cal.prodId('//tvcal.retromediation.net//TVCal//EN');

  var query = req.query.q;
  if (!query) {
    return res.send('No Query!');
  }

  var series = query.split(';');
  console.log(series);

  seriesAndEpisodes = series.map(function(s) {
    var showName;

    return request({ url: 'http://api.tvmaze.com/singlesearch/shows/?q=' + s, json: true })
      .then(function(show) {
        if (show.status !== 'Running')
          return;

        showName = show.name;

        return request({ url: 'http://api.tvmaze.com/shows/' + show.id + '/episodes', json: true });
      })
      .then(function(episodes) {
        if (!episodes)
          return;

        return episodes.filter(function(episode) {
          return new Date(episode.airstamp) >= new Date();
        }).forEach(function(episode) {
          cal.createEvent({
            start: new Date(episode.airstamp),
            end: new Date(new Date(episode.airstamp).getTime() + episode.runtime*60*1000),
            summary: showName + ' [S' + episode.season.pad() + 'E' + episode.number.pad() + ']',
            description: episode.name + '\n' + episode.url
          });
        });
      });
  });

  Promise.all(seriesAndEpisodes).then(function() {
    cal.serve(res);
    // res.send(cal.toString());
  });

});

app.get('/*', function (req, res) {
  res.send('');
});

app.listen(5000, function () {
  console.log('TVCal listening on port 5000!');
});
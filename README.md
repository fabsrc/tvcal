# TVCal
[![Build Status](https://img.shields.io/travis/fabsrc/tvcal.svg?style=flat-square)](https://travis-ci.org/fabsrc/tvcal)
[![Dependencies](https://img.shields.io/david/fabsrc/tvcal.svg?style=flat-square)](https://david-dm.org/fabsrc/tvcal)
[![Development Dependencies](https://img.shields.io/david/dev/fabsrc/tvcal.svg?style=flat-square)](https://david-dm.org/fabsrc/tvcal?type=dev)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)


A Node.js server providing the air dates of upcoming TV show episodes as ical/webcal.

## Install

```bash
$ npm install
```

## Start

```bash
$ npm start
```

## Usage

### Use Selector Application

To select shows to get air dates for go to `http://localhost:5000` and use the web application. It will create a webcal-url which you can add to your calendar.


### Get air dates by show titles

```http
webcal://localhost:5000/shows/?q=shameless;brooklyn%20nine-nine
```

### Get air dates by [TVMaze](http://tvmaze.com/) ids

```http
webcal://localhost:5000/shows/150;49
```

### Use as a Module

Returns a calendar object which is created by [ical-generator](https://github.com/sebbo2002/ical-generator).

```js
const tvcal = require('tvcal')

tvcal({
	name: 'Cal-Name',
	domain: 'Cal-Domain',
	showIds: [150, 49], // Use either showIds or showTitles
	// showTitles: ['Shameless', 'Brooklyn Nine-Nine'], // Alternative to showIds
	filterDate: new Date(new Date() - 14 * 24 * 60 * 60 * 1000) // Filter episodes which are older than two weeks
}).then(cal => {
	console.log(cal.toString())
})
```

## Development

```bash
npm run dev
```

## Credits

This application makes use of the [TVMaze API](http://www.tvmaze.com/api).

## License

Licensed under the [MIT License](http://opensource.org/licenses/mit-license.php).

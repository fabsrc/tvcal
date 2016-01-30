# TVCal

A Node.js server providing the air dates of TV episodes as ical/webcal.

## Install

```bash
$ npm install
```

## Start

```bash
$ node main
```

## Usage

### Get air dates by series titles

```http
webcal://localhost:5000/shows/?q=shameless;brooklyn%20nine-nine
```

### Get air dates by [TVMaze](http://tvmaze.com/) ids

```http
webcal://localhost:5000/shows/150;49
```

## Credits

This application makes use of the [TVMaze API](http://www.tvmaze.com/api).

## License

Copyright (c) 2016 Fabian Schneider
Licensed under the [MIT License](http://opensource.org/licenses/mit-license.php).

# TVCal

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

### Get air dates by series title

```http
webcal://localhost:5000/shows/?q=shameless;brooklyn%20nine-nine
```

### Get air dates by [TVMaze](http://tvmaze.com/) id

```http
webcal://localhost:5000/shows/150;49
```

## Credits

This application makes use of the [TVMaze API](http://www.tvmaze.com/api).

## License

Licensed under the [MIT License](http://opensource.org/licenses/mit-license.php).

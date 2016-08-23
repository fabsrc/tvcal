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

## Development

```bash
npm run dev
```

## Credits

This application makes use of the [TVMaze API](http://www.tvmaze.com/api).

## License

Licensed under the [MIT License](http://opensource.org/licenses/mit-license.php).

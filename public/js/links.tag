<links>

<div class="app-links">
  <div class="circle-icon link-import" onclick="{ importLink }">
    <i class="icon-arrow-up icons"></i>
  </div>

  <div class="link { -hidden: Object.keys(selected).length === 0 }">
    <a hide="{ showIdLinks }" href="webcal://{ host }/shows/{ Object.keys(selected).join(';') }">webcal://{ host }/shows/{ Object.keys(selected).join(';') }</a></h4>
    <a show="{ showIdLinks }" href="webcal://{ host }/shows/?q={ extractNames(selected).join(';') }">webcal://{ host }/shows/?q={ extractNames(selected).join(';') }</a>
  </div>

  <div class="circle-icon link-switch" onclick="{ switchLinks }">
    <i class="icon-link icons"></i>
  </div>
</div>

<script>
  var self = this;
  var request = new XMLHttpRequest();
  self.selected = opts.app.selected
  self.showIdLinks = false

  var parser = document.createElement('a');
  parser.href = window.location.pathname
  self.host = parser.host

  extractNames(selected) {
    return Object.keys(selected).map(id => {
      return encodeURIComponent(selected[id].name)
    })
  }

  switchLinks() {
    self.showIdLinks = !self.showIdLinks
  }

  importLink() {
    var link = document.createElement('a')
    link.href = prompt('Import TVCal Link')

    var isSearch = !!link.search
    var query = link.search && link.search.match(/\?q=(.*)/i) ||
                link.pathname.match(/\/shows\/([\d|\;]*)/i)

    query = query && query.length > 1 && query[1].split(';')

    if(query && query.length > 0) {
      self.selected = {}
      var url = isSearch ? 'http://api.tvmaze.com/singlesearch/shows?q=' :
                          'http://api.tvmaze.com/shows/'

      var requests = query.map(function(show) {
        return axios.get(url + show)
          .then(function(show) {
            show = show.data
            show.insertDate = new Date()
            self.selected[show.id] = show
          })
      })
      axios.all(requests).then(function() {
        opts.app.update({ selected: self.selected })
      })
    }
  }
</script>

</links>

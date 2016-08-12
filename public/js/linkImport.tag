<linkImport>

<div class="button import-button" onclick="{ import }">Import Link</i></div>

<script>
  var self = this

  import() {
    var link = prompt('Import TVCal Link')

    var isSearch = link && !!link.match(/\?q=(.*)/i)
    var query = link && (link.match(/\?q=(.*)/i) ||
                link.match(/\/shows\/([\d|\;]*)/i)) ||
                null

    query = query && query.length > 1 && query[1].split(';')

    if (query && query.length > 0) {
      opts.selected = {}
      var url = isSearch ? 'http://api.tvmaze.com/singlesearch/shows?q=' :
                          'http://api.tvmaze.com/shows/'

      var requests = query.map(function(show) {
        return axios.get(url + show)
          .then(function(show) {
            show = show.data
            show.insertDate = new Date()
            opts.selected[show.id] = show
          })
      })
      axios.all(requests).then(function() {
        self.parent.update({ selected: opts.selected })
      })
    }
  }
</script>
</linkImport>

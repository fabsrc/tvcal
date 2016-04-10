<links>

<div class="app-links">
  <!-- <div class="circle-icon link-import" onclick="{ importLink }">
    <i class="icon-arrow-up icons"></i>
  </div> -->

  <div class="link { -hidden: Object.keys(selected).length === 0 }">
    <a class="ui-button" href="{ getLink() }">Open Link</a>
    <a class="ui-button" onclick="{ showLink }">Show Link</a>
    <a class="ui-button" onclick="{ copyLink }">Copy Link</a>
    <a class="ui-button" onclick="{ importLink }">Import Link</a>
    <!-- <a hide="{ showIdLinks }" href="webcal://{ host }/shows/{ Object.keys(selected).join(';') }">webcal://{ host }/shows/{ Object.keys(selected).join(';') }</a></h4>
    <a show="{ showIdLinks }" href="webcal://{ host }/shows/?q={ extractNames(selected).join(';') }">webcal://{ host }/shows/?q={ extractNames(selected).join(';') }</a> -->
  </div>

 <!--  <div class="circle-icon link-switch" onclick="{ switchLinks }">
    <i class="icon-link icons"></i>
  </div> -->
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

  copyLink(event) {
    var textArea = document.createElement("textarea");
    event.target.classList.add('-copied');
    event.target.text = 'Link copied';
    textArea.value = self.getLink();
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.parentNode.removeChild(textArea);
  }

  getLink() {
    if (self.showIdLinks) {
      return 'webcal://' + self.host + '/shows/' + Object.keys(self.selected).join(';');
    }
    return 'webcal://' + self.host + '/shows/?q=' + self.extractNames(self.selected).join(';');
  }

  // switchLinks() {
  //   self.showIdLinks = !self.showIdLinks
  // }

  importLink() {
    var link = prompt('Import TVCal Link')

    var isSearch = link && !!link.match(/\?q=(.*)/i)
    var query = link && (link.match(/\?q=(.*)/i) ||
                link.match(/\/shows\/([\d|\;]*)/i)) ||
                null

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

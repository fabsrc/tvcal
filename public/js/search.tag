<search>

<div class="app-search">
  <input class="input" type="text" placeholder="Search" onkeyup={ keyup }>

  <ul class="results">
    <li class="search-result { selected: isSelected(id) }" each={ results } onclick={ toggle }>
      <img class="image" src="{ image.medium }">
      <div class="content">
        <h2>{ name } <span class="text-label green" if={ status == 'Running' }>Running</span></h2>
        <p>{ network.country.code }{ network.country.code ? ', ' : '' }{ new Date(premiered).getFullYear() }</p>
      </div>
      <span class="button"></span>
    </a>
  </ul>
</div>

<script>
  var self = this;
  var request = new XMLHttpRequest();
  self.selected = opts.app.selected

  keyup(e) {
    request.open('GET', 'http://api.tvmaze.com/search/shows?q=' + e.target.value, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        if (data) {
          var results = data.map(s => s.show).map(s => { s.network = s.network || s.webChannel; return s; } )
          self.update({ results: results })
        }
      }
    };
    request.send();
  }

  toggle(e) {
    if (self.isSelected(e.item.id)) {
      delete self.selected[e.item.id]
    } else {
      e.item.insertDate = new Date()
      self.selected[e.item.id] = e.item
    }
    opts.app.update()
  }

  isSelected(id) {
    return !!self.selected[id]
  }
</script>

</search>

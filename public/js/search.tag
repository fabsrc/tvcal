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
    </li>
  </ul>
</div>

<script>
  var self = this;
  self.selected = opts.app.selected

  keyup(e) {
    axios.get('http://api.tvmaze.com/search/shows?q=' + e.target.value)
      .then(function(response) {
        if (response && response.data) {
          var results = response.data.map(s => s.show).map(s => { s.network = s.network || s.webChannel; return s; } )
          self.update({ results: results })
        }
      })
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

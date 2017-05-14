<search>

<div class="app-search">
  <input class="input" type="text" placeholder="Search show..." onkeyup={ keyup }>

  <div show="{ results }" class="results">
    <ul class=" shows-list">
      <li class="list-item" data-is="list-item" each="{ results }" search-item="{ true }" onclick="{ toggleItem }"></li>
    </ul>
  </div>
</div>

<script>
  this.keyup = (e) => {
    window.fetch('//api.tvmaze.com/search/shows?q=' + e.target.value)
      .then(res => res.json())
      .then((data) => {
        const results = data.map(s => s.show)
        this.update({ results })
      })
  }
</script>
</search>

<app>

<div class="app-container">
  <header class="app-header">
    <h1>TVCal</h1>
    <p class="subline">Air dates of your favorite TV shows in your calendar.</p>
  </header>

  <links app={ this }></links>

  <div class="flex-container">
    <list app={ this }></list>
    <search app={ this }></search>
  </div>

  <footer class="app-footer">
    <p>© { year } <a href="https://github.com/fabsrc">fabsrc</a>.<br/>Licensed under the <a href="https://opensource.org/licenses/MIT">MIT</a> license.<br>Data from <a href="http://www.tvmaze.com/">TVmaze.com.</a></p>
    <p></a></p>
  </footer>
</div>

<script>
  var self = this
  var STORAGE_KEY = 'tvcal-selector'
  self.year = new Date().getFullYear()

  self.selected = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}

  self.on('updated', function(e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(self.selected));
  })
</script>

</app>
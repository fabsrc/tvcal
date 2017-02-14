<app>

<div class="app-container" style="color: {opts.color}">
  <header class="app-header">
    <h1 class="headline">TVCal</h1>
    <p class="subline">Air dates of your favorite TV shows in your calendar.</p>
    <a class="app-toggle list-toggle { -active: listOpen }" onclick={ toggleList }><i class="icon-list"></i><div class="count" if={ Object.keys(selected).length }>{ Object.keys(selected).length }</div></a>
    <a class="app-toggle link-toggle { -active: linkOpen }" onclick={ toggleLink }><i class="icon-arrow-right-circle"></i></a>
  </header>

  <links items={ selected } show={ linkOpen }></links>

  <list items={ selected } show={ listOpen }></list>

  <search items={ selected } hide={ linkOpen || listOpen }></search>

  <footer class="app-footer">
    <p>© { year } <a href="https://github.com/fabsrc" target="_blank">fabsrc</a><br/>
    Licensed under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT</a> license.<br/>
    Data from <a href="http://www.tvmaze.com/" target="_blank">TVmaze.com.</a></p>
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

  toggleList() {
    this.listOpen = !this.listOpen
  }

  toggleLink() {
   this.linkOpen = !this.linkOpen
  }
</script>

</app>

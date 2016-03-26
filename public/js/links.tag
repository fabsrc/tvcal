<links>

<div class="app-links { -hidden: Object.keys(selected).length === 0 }">
  <div class="link" hide="{ showIdLinks }">
      <a href="webcal://{ host }/shows/{ Object.keys(selected).join(';') }">webcal://{ host }/shows/{ Object.keys(selected).join(';') }</a></h4>
  </div>

  <div class="link" show="{ showIdLinks }">
    <a href="webcal://{ host }/shows/?q={ extractNames(selected).join(';') }">webcal://{ host }/shows/?q={ extractNames(selected).join(';') }</a>
  </div>

  <div class="link-switch">
    <div class="button" onclick="{ switchLinks }">
      <i class="icon-link icons"></i>
    </div>
  </div>
</div>

<script>
  this.selected = opts.app.selected
  this.showIdLinks = false

  var parser = document.createElement('a');
  parser.href = window.location.pathname
  this.host = parser.host

  extractNames(selected) {
    return Object.keys(selected).map(id => {
      return encodeURIComponent(selected[id].name)
    })
  }

  switchLinks() {
    this.showIdLinks = !this.showIdLinks
  }
</script>

</links>

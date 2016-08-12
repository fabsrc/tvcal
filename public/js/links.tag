<links>

<div class="app-links">
  <input class="link" value="{ getLink() }" onClick="this.select()" readonly>

  <div class="link-buttons">
    <linkImport></linkImport>
    <div class="button copy-button" onclick="{ copyLink }">Copy Link</div>
    <div class="button switch-button" onclick="{ switchLinks }">Switch Links</dib>
  </div>
</div>

<script>
  var self = this
  self.showIdLinks = false

  var parser = document.createElement('a')
  parser.href = window.location.pathname
  self.host = parser.host

  extractNames(selected) {
    return Object.keys(selected).map(id => {
      return encodeURIComponent(selected[id].name)
    })
  }

  copyLink(event) {
    var textArea = document.createElement("textarea")
    event.target.classList.add('-active')
    event.target.innerText = 'Link copied'
    textArea.value = self.getLink()
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    textArea.parentNode.removeChild(textArea)

    setTimeout(function() {
      event.target.classList.remove('-active')
      event.target.innerText = 'Copy Link'
    }, 3000);
  }

  getLink() {
    if (Object.keys(opts.items).length === 0) {
      return 'No shows added yet'
    } else if (self.showIdLinks) {
      return 'webcal://' + self.host + '/shows/' + Object.keys(opts.items).join(';')
    } else {
      return 'webcal://' + self.host + '/shows/?q=' + self.extractNames(opts.items).join(';')
    }
  }

  switchLinks() {
    self.showIdLinks = !self.showIdLinks
  }

</script>

</links>

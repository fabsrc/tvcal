<saveLink>

<div>
  <input class="save-link" value="{ savedLink }" onClick="this.select()" show="{ savedLink }" readonly>
  <div class="button save-button" onclick="{ saveLink }">Save Link</div>
</div>

<script>
  var self = this
  
  saveLink () {
    axios.put('/list/' + this.getLinkId(), { hello: 'hello' }})
      .then(function(response) {
        if (response && response.data) {
          console.log(response.data)
          self.update({ savedLink: response.data })
        }
      })
  }
  
  getLinkId () {
    return opts.linkId || Date.now()
  }

</script>

</saveLink>

<url>

<div class="app-url">
  <input class="url" value="{ getLink() }" onClick="this.select()" readonly>
</div>

<script>
  this.getLink = () => `webcal://${window.location.host}/lists/${this.store.getState().listId}`
</script>

</url>

<url>

<div class="app-url">
  <a class="url" href="{ getLink() }">{ getLink() }</a>
</div>

<script>
  this.getLink = () => `webcal://${window.location.host}/lists/${this.store.getState().listId}`
</script>

</url>

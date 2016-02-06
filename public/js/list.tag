<list>

<ul class="selected-list">
  <li class="selected-item" each={ order(selected) }>
    <span>{ name }</span>
    <span class="remove" onclick={ remove }>✖</span>
  </li>
</ul>

<script>
  this.selected = opts.app.selected

  order(shows) {
    return Object.keys(shows).map(function (key) {
      return shows[key]
    }).sort(function(a,b) {
      return new Date(b.insertDate) - new Date(a.insertDate);
    })
  }

  remove(e) {
    delete this.selected[e.item.id]
    opts.app.update()
  }
</script>

</list>

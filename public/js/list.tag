<list>

<ul class="selected-list">
  <li class="list-item" each={ order(items) } onclick={ remove }>
    <span class="name">{ name }</span>
    <span class="remove">╳</span>
  </li>
  <li if={ !items.length }>No Shows added yet</li>
</ul>

<script>
  order () {
    return Object.keys(opts.items).map(function (key) {
      return opts.items[key]
    }).sort(function (a,b) {
      return new Date(b.insertDate) - new Date(a.insertDate);
    })
  }

  remove(e) {
    delete opts.items[e.item.id]
    this.parent.update()
  }
</script>

</list>

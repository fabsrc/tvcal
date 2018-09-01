<app>

<div class="app-container">
  <header class="app-header _no-select">
    <h1 class="title" onclick="{ resetToggles }">TVCal</h1>
    <ul class="app-navigation">
      <li class="link { -active: urlActive }" show="{ this.items }" onclick="{ toggleUrl }">
        <svg width="100%" height="100%">
          <use xlink:href="#link" x="5" y="5"/>
        </svg>
      </li>
      <li class="edit { -active: editActive }" show="{ this.items }" onclick="{ toggleEdit }">
        <svg width="100%" height="100%">
          <use xlink:href="#plus" width="70%" height="70%" x="5" y="5"/>
        </svg>
      </li>
      <li class="search { -active: searchActive }" onclick="{ toggleSearch }">
        <svg width="100%" height="100%">
          <use xlink:href="#search" width="70%" height="70%" x="5" y="5"/>
        </svg>
      </li>
    </ul>
  </header>

  <url show="{ urlActive }"></url>

  <search if="{ searchActive }"></search>

  <section class="shows-section { -hidden: searchActive }">
    <ul class="shows-list">
      <li class="list-item" data-is="list-item" each="{ orderBy(items) }"></li>
    </ul>
  </section>
</div>

<script>
  import './list-item.tag'
  import './search.tag'
  import './url.tag'
  import moment from 'moment'

  this.toggleSearch = () => {
    this.searchActive = !this.searchActive
    if (this.searchActive) {
      this.editActive = false
      this.urlActive = false
    }
  }

  this.toggleEdit = () => {
    this.editActive = !this.editActive
    if (this.editActive) {
      this.searchActive = false
      this.urlActive = false
    }
  }

  this.toggleUrl = (e) => {
    if (!this.store.getState().listId) {
      this.createList()
    }

    this.urlActive = !this.urlActive
    if (this.urlActive) {
      this.searchActive = false
      this.editActive = false
    }
  }

  this.resetToggles = () => {
    this.searchActive = false
    this.editActive = false
    this.urlActive = false
  }

  this.store.subscribe(() => {
    this.state = this.store.getState()
    this.items = this.state.items
    this.update()
  })

  this.createList = () => {
    window.fetch('/lists', {
      method: 'POST',
      body: this.items.map(item => item.id).join(';')
    })
    .then(res => res.json())
    .then((res) => {
      this.store.dispatch({ type: 'PUT_LIST_ID', id: res._id })
      window.history.replaceState({}, document.title, '#' + res._id)
    })
  }

  this.orderBy = (items = []) => {
    return items.slice().sort((a, b) => {
      if (a.status === 'Ended' && b.status === 'Ended') {
        return moment(a.premiered) < moment(b.premiered)
      } else if (a.status === 'Ended') {
        return 1
      } else if (b.status === 'Ended') {
        return -1
      }

      const [aNextEpisode, bNextEpisode] = [a, b].map(item => {
        const match = item._links.nextepisode && item._links.nextepisode.href.match(/\/(\d+)$/)
        const nextEpisodeId = match && match[1] || null
        return item._embedded && item._embedded.episodes.find((ep) =>  ep.id === +nextEpisodeId)
      })

      if (!aNextEpisode && !bNextEpisode) {
        return moment(a.premiered) < moment(b.premiered)
      } else if (!aNextEpisode) {
        return 1
      } else if (!bNextEpisode) {
        return -1
      }

      return moment(aNextEpisode.airstamp) > moment(bNextEpisode.airstamp)
    })
  }
</script>

</app>

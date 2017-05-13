<app>

<div class="app-container">
  <header class="app-header _no-select">
    <h1 class="title">TVCal</h1>
    <ul class="app-navigation">
      <li class="link { -active: urlActive }" onclick="{ toggleUrl }">
        <svg width="100%" height="100%">
          <use xlink:href="#link" x="5" y="5"/>
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

  <search show="{ searchActive }"></search>

  <section class="shows-section { -faded: searchActive }">
    <div each="{ itemsSortedArray }" if="{ shows.length }" class="shows-subsection">
      <h4 class="title">{ title }</h4>
      <ul class="shows-list">
        <li class="list-item" data-is="list-item" each="{ shows }"></li>
      </ul>
    </div>
  </section>
</div>

<script>
  require('./list-item.tag')
  require('./search.tag')
  require('./url.tag')

  this.toggleSearch = (e) => {
    this.searchActive = !this.searchActive
  }

  this.toggleUrl = (e) => {
    if (!this.store.getState().listId) {
      this.createList()
    }

    this.urlActive = !this.urlActive
  }

  this.store.subscribe(() => {
    this.items = this.store.getState().items
    this.itemsSorted = this.sortAndMap(this.items)
    this.itemsSortedArray = Object.keys(this.itemsSorted).map((item) => {
      return { title: item, shows: this.itemsSorted[item] }
    })

    this.update()
  })

  this.sortAndMap = (items) => {
    const mappedItems = {
      'Today': [],
      'Tomorrow': [],
      'This Week': [],
      'Next Week': [],
      'Later': [],
      'No New Episodes': [],
      'Ended': []
    }
    const sortedItems = items.sort((a, b) => {
      const aNextEpisode = a._embedded.episodes.filter((episode) => {
        return window.moment(episode.airstamp).diff(window.moment().set({ hour: 0, minute: 0, second: 0, ms: 0 }).subtract(1, 'day')) >= 0
      })[0] || false
      const bNextEpisode = b._embedded.episodes.filter((episode) => {
        return window.moment(episode.airstamp).diff(window.moment().set({ hour: 0, minute: 0, second: 0, ms: 0 }).subtract(1, 'day')) >= 0
      })[0] || false

      if (aNextEpisode && bNextEpisode) {
        return window.moment(aNextEpisode.airstamp).diff(window.moment(bNextEpisode.airstamp))
      } else {
        return aNextEpisode ? 0 : 1
      }
    })

    sortedItems.forEach((item) => {
      const nextEpisode = item._embedded.episodes.filter((episode) => {
        return window.moment(episode.airstamp).diff(window.moment().set({ hour: 0, minute: 0, second: 0, ms: 0 }).subtract(1, 'day')) >= 0
      })[0] || false

      if (nextEpisode) {
        const nextEpisodeDate = window.moment(nextEpisode.airstamp)

        if (nextEpisodeDate.get('date') === window.moment().get('date')) {
          mappedItems['Today'].push(item)
        } else if (nextEpisodeDate.get('date') === window.moment().add(1, 'day').get('date')) {
          mappedItems['Tomorrow'].push(item)
        } else if (nextEpisodeDate.isoWeek() === window.moment().isoWeek()) {
          mappedItems['This Week'].push(item)
        } else if (nextEpisodeDate.isoWeek() === window.moment().add(1, 'week').isoWeek()) {
          mappedItems['Next Week'].push(item)
        } else {
          mappedItems['Later'].push(item)
        }
      } else if (item.status === 'Ended') {
        mappedItems['Ended'].push(item)
      } else {
        mappedItems['No New Episodes'].push(item)
      }
    })

    mappedItems['Ended'].sort((a, b) => window.moment(a.premiered).year() < window.moment(b.premiered).year())
    mappedItems['No New Episodes'].sort((a, b) => window.moment(a.premiered).year() < window.moment(b.premiered).year())

    return mappedItems
  }

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
</script>

</app>

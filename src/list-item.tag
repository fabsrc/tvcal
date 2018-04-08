<list-item>
  <img class="image" if="{ image }" src="{ image && getImage() }" alt="{ name }">
  <div class="details">
    <div class="badges _no-select">
      <span class="green-badge" if="{ nextEpisode }">{ window.moment(nextEpisode.airstamp).format('MMM DD • HH:mm') }</span>
      <span class="blue-badge" if="{ nextEpisode }">{ nextEpisodeInfo }</span>
      <span class="gray-badge" if="{ status === 'Ended' }">Ended</span>
      <span class="green-badge" if="{ opts.searchItem && status === 'Running' }">Running</span>
    </div>
    <h3 class="name">{ name }</h3>
    <div class="info">{ seriesInfo }</div>
  </div>
  <div class="toggle { -active: isSelected() }" if="{ opts.searchItem }">
    <svg width="100%" height="100%">
      <use xlink:href="#plus" x="6" y="6.5"/>
    </svg>
  </div>
  <div class="delete { -active: isSelected() }" if="{ this.parent.searchActive }" onclick="{ removeItem }">
    <svg width="100%" height="100%">
      <use xlink:href="#plus" x="6" y="6.5"/>
    </svg>
  </div>

  <script>
    this.on('before-mount', () => {
      const network = this.network || this.webChannel

      this.seriesInfo = `${network && network.country && network.country.code}, ${(window.moment(this.premiered).year() || '')}`
      this.nextEpisode = (() => {
        if (this.status === 'Running' && this._embedded && this._embedded.episodes) {
          return this._embedded.episodes.filter(episode => window.moment(episode.airstamp).diff(window.moment().set({ hour: 0, minute: 0, second: 0, ms: 0 }).subtract(1, 'day')) >= 0)[0] || false
        }
      })()
      this.nextEpisodeInfo = this.nextEpisode && `S${this.nextEpisode.season < 10 ? 0 : ''}${this.nextEpisode.season}E${this.nextEpisode.number < 10 ? 0 : ''}${this.nextEpisode.number}`
    })

    this.getImage = () => this.image.medium.replace(/^http:/, '')

    this.addItem = (e) => {
      window.fetch('//api.tvmaze.com/shows/' + this.id + '?embed=episodes')
        .then(res => res.json())
        .then((data) => {
          this.store.dispatch({ type: 'ADD_ITEM', item: data })
        })
    }

    this.removeItem = (e) => {
      this.store.dispatch({ type: 'REMOVE_ITEM', item: this })
    }

    this.toggleItem = (e) => {
      if (this.isSelected()) {
        this.removeItem(e)
      } else {
        this.addItem(e)
      }
    }

    this.isSelected = () => {
      return this.store.getState().items.some(({ id }) => id === this.id)
    }
  </script>
</list-item>

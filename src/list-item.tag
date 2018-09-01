<list-item>
  <img class="image" if="{ image }" src="{ image && getImage() }" alt="{ name }">
  <div class="details">
    <div class="badges _no-select">
      <span class="green-badge" if="{ nextEpisode }">{ nextEpisodeDate }</span>
      <span class="blue-badge" if="{ nextEpisode }">{ nextEpisodeInfo }</span>
      <span class="gray-badge" if="{ status === 'Ended' }">Ended</span>
      <span class="green-badge" if="{ opts.searchItem && status === 'Running' }">Running</span>
    </div>
    <h3 class="name">{ name }</h3>
    <div class="info">{ seriesInfo }</div>
  </div>
  <div class="toggle { -active: isSelected }" if="{ opts.searchItem }">
    <svg width="100%" height="100%">
      <use xlink:href="#plus" x="6" y="6.5"/>
    </svg>
  </div>
  <div class="delete" if="{ this.parent.editActive }" onclick="{ removeItem }">
    <svg width="100%" height="100%">
      <use xlink:href="#plus" x="6" y="6.5"/>
    </svg>
  </div>

  <script>
    import moment from 'moment'

    this.on('before-mount', () => {
      const network = this.network || this.webChannel
      const countryCode = network && network.country && network.country.code
      const year = moment(this.premiered).year()

      this.seriesInfo = `${countryCode || ''}${countryCode && year && ', ' || ''}${year || ''}`
      this.nextEpisode = (() => {
        if (this.status !== 'Ended' && this._links && this._links.nextepisode) {
          const nextEpisodeMatch = this._links.nextepisode && this._links.nextepisode.href.match(/\/(\d+)$/)
          const nextEpisodeId = nextEpisodeMatch && nextEpisodeMatch[1]
          return this._embedded && this._embedded.episodes.find((ep) => ep.id === +nextEpisodeId);
        }
      })()
      this.nextEpisodeInfo = this.nextEpisode && `S${this.nextEpisode.season < 10 ? 0 : ''}${this.nextEpisode.season}E${this.nextEpisode.number < 10 ? 0 : ''}${this.nextEpisode.number}`
      this.nextEpisodeDate = this.nextEpisode && moment(this.nextEpisode.airstamp).format('MMM DD • HH:mm')
    })

    this.getImage = () => this.image.medium.replace(/^http:/, '')

    this.addItem = (e) => {
      window.fetch('//api.tvmaze.com/shows/' + this.id + '?embed=episodes')
        .then(res => res.json())
        .then((data) => {
          this.store.dispatch({ type: 'ADD_ITEM', item: data })
        })
      this.isSelected = true
    }

    this.removeItem = (e) => {
      this.store.dispatch({ type: 'REMOVE_ITEM', item: this })
      this.isSelected = false
    }

    this.toggleItem = (e) => {
      if (this.isSelected) {
        this.removeItem(e)  
      } else {
        this.addItem(e)
      }
    }

    this.isSelected = this.store.getState().items.some(({ id }) => id === this.id)
  </script>
</list-item>

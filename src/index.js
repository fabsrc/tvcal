import { compose, createStore } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
import riotRedux from 'riot-redux'
import reducer from './reducer'

const store = createStore(
  reducer,
  undefined,
  compose(
    autoRehydrate()
  )
)

persistStore(store, {}, () => {
  if (!window.location.hash) {
    const listId = store.getState().listId
    if (listId) {
      window.history.replaceState({}, document.title, '#' + listId)
    }
  } else {
    const listId = window.location.hash.replace(/^#/, '')

    window.fetch('/lists/' + listId + '?raw=true')
      .then((res) => {
        if (res.status === 404) {
          throw new Error('Not found')
        }

        return res.json()
      })
      .then((res) => {
        if (res.list) {
          Promise.all(res.list.split(';').map(id => window.fetch('https://api.tvmaze.com/shows/' + id + '?embed=episodes')))
            .then(ress => Promise.all(ress.map(res => res.json())))
            .then(ress => {
              store.dispatch({ type: 'ADD_ITEMS', items: ress })
              store.dispatch({ type: 'PUT_LIST_ID', id: listId })
            })
        }
      })
      .catch((err) => {
        console.error(err)
        window.history.replaceState({}, document.title, '#')
      })
  }
})
window.riot.mixin(riotRedux(store))

require('./app.tag')
window.riot.mount('*')

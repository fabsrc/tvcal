import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { createStore } from 'redux'
import riotRedux from 'riot-redux'
import reducer from './reducer'
import riot from 'riot'

const persistConfig = {
  key: 'tvcal',
  storage
}
const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer)

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
          Promise.all(res.list.split(';').map(id => window.fetch('//api.tvmaze.com/shows/' + id + '?embed=episodes')))
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
riot.mixin(riotRedux(store))

import './app.tag'
riot.mount('*')

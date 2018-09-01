module.exports = (state = { items: [], listId: '' }, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      if (!state.items.some(({ id }) => id === action.item.id)) {
        const items = state.items.concat([action.item])

        if (state.listId) {
          window.fetch('/lists/' + state.listId, {
            method: 'PUT',
            body: items.map(item => item.id).join(';')
          })
        }

        return Object.assign({}, state, { items })
      }

      return state
    case 'REMOVE_ITEM':
      const items = state.items.filter(({ id }) => id !== action.item.id)

      if (state.listId) {
        window.fetch('/lists/' + state.listId, {
          method: 'PUT',
          body: items.map(item => item.id).join(';')
        })
      }

      return Object.assign({}, state, { items })
    case 'ADD_ITEMS':
      return Object.assign({}, state, { items: action.items })
    case 'PUT_LIST_ID':
      const listId = action.id
      return Object.assign({}, state, { listId })
    default:
      return state
  }
}

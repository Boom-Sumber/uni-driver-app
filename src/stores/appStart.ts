import { defineStore } from 'pinia'

export const useAppStartStore = defineStore('appStart', {
  state: () => ({
    isStarted: false,
  }),
  actions: {
    setStarted(isStarted: boolean) {
      this.isStarted = isStarted
    },
  },
})

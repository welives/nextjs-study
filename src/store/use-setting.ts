import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { locales, defaultLocale, StoreSceneKey } from '../constants'
import { createSelectors } from './selectors'

interface State {
  defaultLocale: string
  locales: string[]
  isAdmin: boolean
}

interface Action {
  setDefaultLocale: (newVal: string) => void
  setIsAdmin: (newVal: boolean) => void
}

type SettingState = State & Action

const initialState: State = {
  defaultLocale,
  locales: [...locales],
  isAdmin: false
}

const store = create<SettingState>()(
  immer(
    persist(
      (set) => ({
        ...initialState,
        setDefaultLocale: (val) => set({ defaultLocale: val }),
        setIsAdmin: val => set({ isAdmin: val })
      }),
      { name: StoreSceneKey.SETTING, storage: createJSONStorage(() => sessionStorage) }
    )
  )
)

export const useSettingStore = createSelectors(store)
export function useSettingReset() {
  store.setState(initialState)
}

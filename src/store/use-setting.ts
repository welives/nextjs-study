import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { locales, defaultLocale, StoreSceneKey } from '../constants'
import { createSelectors } from './selectors'

interface State {
  defaultLocale: string
  locales: string[]
}

interface Action {
  setDefaultLocale: (newVal: string) => void
}

type SettingState = State & Action

const initialState: State = {
  defaultLocale,
  locales: [...locales],
}

const store = create<SettingState>()(
  immer(
    persist(
      (set) => ({
        ...initialState,
        setDefaultLocale: (val) => set({ defaultLocale: val }),
      }),
      { name: StoreSceneKey.SETTING, storage: createJSONStorage(() => sessionStorage) }
    )
  )
)

export const useSettingStore = createSelectors(store)
export function useSettingReset() {
  store.setState(initialState)
}

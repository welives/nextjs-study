import { useMediaQuery } from 'react-responsive'
import { BREAK_POINTS } from '../constants'

type Key = keyof typeof BREAK_POINTS
type KeyAbove = `isAbove${Capitalize<Key>}`
type KeyBelow = `isBelow${Capitalize<Key>}`

export function useBreakpoints(breakpointKey: Key) {
  const breakpointValue = BREAK_POINTS[breakpointKey]
  const bool = useMediaQuery({
    query: `(max-width: ${breakpointValue})`,
  })
  const capitalizedKey = breakpointKey[0].toUpperCase() + breakpointKey.substring(1)

  return {
    [breakpointKey]: Number(String(breakpointValue).replace(/[^0-9]/g, '')),
    [`isAbove${capitalizedKey}`]: !bool,
    [`isBelow${capitalizedKey}`]: bool,
  } as Record<Key, number> & Record<KeyAbove | KeyBelow, boolean>
}

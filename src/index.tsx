import component from './component'
import props from './props'
import rawUseCoverable from './useCoverable'
import value from './value'

export const useCoverable = Object.assign(rawUseCoverable, {
  component,
  props,
  value,
})
export * from './types'
export default useCoverable

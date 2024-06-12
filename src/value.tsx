import { deepConfigItemFilter, deepMerge } from './helpers'
import { CoverableValue, CoverableValueConfig } from './types'

export default function createValue<V, T>(
  valueConfig: CoverableValueConfig<V, T>,
) {
  return {
    onCovered: (current, config) =>
      deepMerge(current, config, deepConfigItemFilter),
    ...valueConfig,
    __isCoverableValue: () => true,
  } as CoverableValue<V, T>
}

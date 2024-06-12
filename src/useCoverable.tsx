import { get, isObject, memoize, run } from '@fexd/tools'
import { useRef } from 'react'

import {
  cloneDeep,
  deepConfigItemFilter,
  deepMap,
  useLatest,
  useMemoizedFn,
} from './helpers'
import { Coverable } from './types'

export default function useCoverable<T extends Record<string, any>>(
  config: T | ((options: { getConfig: () => Record<string, any> }) => T),
) {
  const configRef = useLatest(config)
  const getFinalConfigRef = useRef<any>({})
  const useConfig = run(configRef.current, undefined, {
    getConfig: () => run(getFinalConfigRef.current),
  }) as T

  const overridedConfigRef = useRef<any>({})
  const override = (config) => (overridedConfigRef.current = cloneDeep(config))
  getFinalConfigRef.current = memoize(() => {
    const defaultConfig = cloneDeep(useConfig ?? {})

    const handledCoverableMark = new Map()
    const mergedConfig = deepMap(defaultConfig, handleItem)

    function handleItem(item, key, keyPath, currentConfig): [boolean, any] {
      const override = get(overridedConfigRef.current, keyPath)

      // 过滤已处理的 coverableValue 项
      if (handledCoverableMark.has(item)) {
        return [false, item]
      }

      if (item?.__isCoverableValue) {
        const result = !override
          ? item?.default
          : run(item, 'onCovered', item?.default, override)
        handledCoverableMark.set(result, true)
        return [false, result]
      }

      const canMerge = deepConfigItemFilter(item)
      const result = canMerge
        ? {
            ...item,
            ...(isObject(override) ? override : {}),
            ...deepMap(item, handleItem, keyPath),
          }
        : override ?? item

      return [canMerge, result]
    }

    handledCoverableMark.clear()

    return mergedConfig
  })

  const getConfig = useMemoizedFn(() => getFinalConfigRef.current() as T)

  return {
    getConfig,
    __isCoverableProps: () => true,
    __cover: override,
  } as any as Coverable<T>
}

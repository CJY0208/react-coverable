import { isArray, isObject, run } from '@fexd/tools'
import { isValidElement, useCallback, useMemo, useRef, useState } from 'react'

export function deepConfigItemFilter(item) {
  if (isArray(item)) {
    return false
  }

  if (item?.$$typeof) {
    return false
  }

  if (item?.__isCoverableValue) {
    return false
  }

  return isObject(item) && !isValidElement(item)
}

export function deepMap<T>(
  input: T,
  handleItem: (
    item: any,
    key: string | number,
    keyPath: (string | number)[],
    currentResult: T,
  ) => [boolean, any] = (item) => [true, item],
  keyPath: (string | number)[] = [],
): T {
  if (Array.isArray(input)) {
    const newArray: any[] = []
    for (let i = 0; i < input.length; i++) {
      const item = input[i]
      const [continueDeep, newItem] = handleItem(
        item,
        i,
        keyPath.concat([i]),
        newArray as T,
      ) ?? [true, item]
      if (
        continueDeep &&
        (Array.isArray(newItem) || typeof newItem === 'object')
      ) {
        newArray.push(deepMap(newItem, handleItem, keyPath.concat([i])))
      } else {
        newArray.push(newItem)
      }
    }
    return newArray as T
  } else if (typeof input === 'object' && input !== null) {
    const newObject: Record<string, any> = {}
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const item = input[key]
        const [continueDeep, newItem] = handleItem(
          item,
          key,
          keyPath.concat([key]),
          newObject as T,
        ) ?? [true, item]
        if (
          continueDeep &&
          (Array.isArray(newItem) || typeof newItem === 'object')
        ) {
          newObject[key] = deepMap(newItem, handleItem, keyPath.concat([key]))
        } else {
          newObject[key] = newItem
        }
      }
    }
    return newObject as T
  } else {
    // If input is neither an array nor an object, return it directly
    return input
  }
}

export function deepMerge(
  obj1: any,
  obj2: any,
  filter?: (value: any, key: string) => boolean,
) {
  const result: any = {}

  ;[obj1, obj2].forEach((arg) => {
    if (isObject(arg)) {
      Object.entries(arg).forEach(([key, value]) => {
        if (isObject(value) && run(filter, undefined, value, key) !== false) {
          result[key] = deepMerge(result[key], value, filter)
        } else {
          result[key] = value
        }
      })
    }
  })

  return result
}

export function cloneDeep<T>(value: T, map = new WeakMap()): T {
  // Check for non-object values and return them directly
  if (value === null || typeof value !== 'object') {
    return value
  }

  // Handle circular references using WeakMap
  if (map.has(value)) {
    return map.get(value)
  }

  // Handle Array type
  if (Array.isArray(value)) {
    const arrCopy: any[] = []
    map.set(value, arrCopy) // add to map before recursion
    value.forEach((item, index) => {
      arrCopy[index] = cloneDeep(item, map)
    })
    return arrCopy as unknown as T
  }

  // Handle Date type
  if (value instanceof Date) {
    return new Date(value) as unknown as T
  }

  // Handle RegExp type
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as unknown as T
  }

  // Handle Object type
  const objCopy: { [key: string]: any } = {}
  map.set(value, objCopy) // add to map before recursion
  Object.keys(value).forEach((key) => {
    objCopy[key] = cloneDeep((value as { [key: string]: any })[key], map)
  })
  return objCopy as T
}

export const useUpdate = () => {
  const [, setState] = useState({})

  return useCallback(() => setState({}), [])
}

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value

  return ref
}

type NOOP = (this: any, ...args: any[]) => any

type PickFunction<T extends NOOP> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>

export function useMemoizedFn<T extends NOOP>(fn: T) {
  const fnRef = useRef<T>(fn)

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo<T>(() => fn, [fn])

  const memoizedFn = useRef<PickFunction<T>>()
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args)
    }
  }

  return memoizedFn.current as T
}

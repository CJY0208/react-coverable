import { isArray, isObject, run } from '@fexd/tools'
import { isValidElement } from 'react'

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

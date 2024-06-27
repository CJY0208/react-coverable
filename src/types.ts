import { ReactChild, ReactElement, ReactNode, ReactPortal } from 'react'
import { DeepPartial, Required } from 'utility-types'

export type CoverableMark<T> = {
  __T__?: T
}

export interface CoverableValueConfig<V, T> {
  default?: V
  config?: T
  onCovered?: (current: V, config: T) => any
}

export interface CoverableValue<V, T> extends CoverableValueConfig<V, T> {
  __isCoverableValue: () => true
}

export type ExcludeCoverableTypes =
  | ((...args: any) => any)
  | any[]
  | null
  | undefined
  | number
  | string
  | boolean
  | symbol
  | bigint
  | ReactChild
  | ReactPortal
  | Iterable<ReactNode>
  | JSX.Element
  | ReactElement

export type DeepCoverable<T> = {
  [K in keyof T]: T[K] extends ExcludeCoverableTypes
    ? T[K]
    : T[K] extends CoverableValue<any, any>
    ? Required<T[K]>['default']
    : T[K] extends object
    ? DeepCoverable<T[K]>
    : T[K]
}

export type Coverable<T> = {
  getConfig: () => DeepCoverable<T>
} & CoverableMark<T>

export type CoverableProps<T> = {
  [K in keyof T]?: T[K] extends ExcludeCoverableTypes
    ? T[K]
    : T[K] extends CoverableMark<any>
    ? CoverableProps<T[K]['__T__']>
    : T[K] extends CoverableValue<any, any>
    ? DeepPartial<T[K]['config']>
    : T[K] extends object
    ? DeepPartial<CoverableProps<T[K]>>
    : T[K]
}

export type DefaultCoverableConfig<T> = {
  readonly [K in keyof T]: T[K] extends ExcludeCoverableTypes
    ? T[K]
    : T[K] extends CoverableMark<any>
    ? DefaultCoverableConfig<Required<T[K]>['__T__']>
    : T[K] extends CoverableValue<any, any>
    ? Readonly<Required<T[K]>['default']>
    : T[K] extends object
    ? DefaultCoverableConfig<T[K]>
    : T[K]
}

// export type CurrentCoverableProps<T> = CoverableProps<T extends CoverableMark<any> ? T & T['__T__'] : T>
// export type DefaultConfig<T> = DefaultCoverableConfig<T extends CoverableMark<any> ? T & T['__T__'] : T>

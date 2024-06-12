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

export type DeepCoverable<T> = {
  [K in keyof T]: T[K] extends CoverableValue<any, any>
    ? Required<T[K]>['default']
    : T extends Array<any>
    ? T[K]
    : T[K] extends object
    ? DeepCoverable<T[K]>
    : T[K]
}

export type Coverable<T> = {
  getConfig: () => DeepCoverable<T>
} & CoverableMark<T>

export type CoverableProps<T> = {
  [K in keyof T]?: T[K] extends CoverableMark<any>
    ? CoverableProps<T[K]['__T__']>
    : T[K] extends CoverableValue<any, any>
    ? DeepPartial<T[K]['config']>
    : T extends Array<any>
    ? T[K]
    : T[K] extends object
    ? DeepPartial<CoverableProps<T[K]>>
    : T[K]
}

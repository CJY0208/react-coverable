import { get, isFunction, run } from '@fexd/tools'
import { useMemoizedFn, useUpdate } from 'ahooks'
import React, { forwardRef, useMemo, useRef } from 'react'

import { deepMap } from './helpers'
import { CoverableMark, CoverableProps } from './types'

export default function createComponent<
  Props extends Record<string, any> & { coverable?: never },
  Ref,
  T,
>(
  useContent: (
    props: Props,
    ref: Ref,
  ) => {
    coverableProps: T
    content: any
  },
  {
    defaultProps,
    propsAreEqual,
  }: {
    defaultProps?: Props
    propsAreEqual?: Parameters<typeof React.memo>['1']
  } = {},
) {
  const Comp = React.memo(
    forwardRef(({ coverable, ...props }: any, ref: any) => {
      const triggerRender = useUpdate()
      const updateMapRef = useRef<any>([])
      const updateConfig = useMemoizedFn(() => {
        updateMapRef.current.map(([coverableProp, keyPath]) => {
          const overrideConfig = get(coverable, keyPath)
          if (overrideConfig) {
            run(coverableProp, '__cover', overrideConfig)
          }
        })
      })
      React.useMemo(updateConfig, [coverable])

      const { content, coverableProps } = useContent(props as Props, ref)

      useMemo(() => {
        deepMap(coverableProps, (item, key, keyPath) => {
          if (key && item?.__isCoverableProps) {
            updateMapRef.current.push([item, keyPath])
          }

          return [true, item]
        })

        if ((coverableProps as any)?.__isCoverableProps) {
          updateMapRef.current.push([coverableProps, []])
        }

        updateConfig()
        if (!isFunction(content)) {
          triggerRender()
        }
      }, [])

      return <>{run(content)}</>
    }),
    propsAreEqual,
  ) as any

  Comp.displayName = useContent?.name
  Comp.defaultProps = { ...defaultProps } as any

  return Comp as React.FC<
    Omit<Props, 'coverable'> & {
      ref?: Ref
      coverable?: CoverableProps<
        T extends CoverableMark<any> ? T & T['__T__'] : T
      >
    }
  > & {
    defaultProps: Omit<Props, 'coverable'> & {
      coverable?: CoverableProps<
        T extends CoverableMark<any> ? T & T['__T__'] : T
      >
    }
    coverableProps: CoverableProps<
      T extends CoverableMark<any> ? T & T['__T__'] : T
    >
  }
}

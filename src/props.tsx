import { run, set } from '@fexd/tools'

import { deepMap } from './helpers'

export default function createPropsRender<T>(coverableConfig: T) {
  return {
    render: (content) => ({
      coverableConfig,
      content,
      getDefaultCoverableConfig: () => {
        let defaultProps = {} as any

        if ((coverableConfig as any)?.__isCoverableProps) {
          defaultProps = run((coverableConfig as any)?.__getRawConfig)
        }

        deepMap(coverableConfig as any, (item, key, keyPath) => {
          if (key && item?.__isCoverableProps) {
            defaultProps = set(defaultProps, keyPath, run(item?.__getRawConfig))
          }

          return [true, item]
        })

        return deepMap(defaultProps as any, (item, key, keyPath) => {
          if (key && item?.__isCoverableValue) {
            return [false, item?.default]
          }

          return [true, item]
        })
      },
    }),
  }
}

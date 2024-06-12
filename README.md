# react-coverable

[![NPM version](https://img.shields.io/npm/v/react-coverable.svg?style=flat)](https://npmjs.org/package/react-coverable)
[![size](https://img.shields.io/bundlephobia/minzip/react-coverable@latest.svg)](https://bundlephobia.com/result?p=react-coverable@latest)
![](https://komarev.com/ghpvc/?username=cjy0208-react-coverable&label=VIEWS)

Write rewritable react component props to make complex components customizable

## Demo

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/react-coverable-demo?file=src%2FApp.tsx)

<img src="./docs/demo.gif">

## Usage

```tsx
import React from 'react'
import { useCoverable } from 'react-coverable'

const CoverableComponent = useCoverable.component(
  (props: { normalProp: number }, ref: any) => {
    const config1 = useCoverable({
      a: {
        b: {
          c: {
            d: 1,
            e: 2,
          },
          f: 3,
        },
      },
      // custom rewrite process
      test: useCoverable.value({
        // default value
        default: {
          a: 1,
          b: 2,
        },
        // configuration item, only used to extract types
        config: {
          c: 3,
          d: 2,
        },
        // the process of merging configuration items and default values
        onCovered: (current, config) => {
          return {
            ...config,
            ...current,
          }
        },
      }),
    })

    const config2 = useCoverable({
      bar: 'bar',
      foo: 'foo',
    })

    return useCoverable
      .props({
        config1,
        config2,
      })
      .render(() => (
        <div style={{ whiteSpace: 'break-spaces' }}>
          <h3>props</h3>
          <div>{JSON.stringify(props, null, 2)}</div>

          <h3>config1</h3>
          <div>{JSON.stringify(config1?.getConfig(), null, 2)}</div>

          <h3>config2</h3>
          <div>{JSON.stringify(config2?.getConfig(), null, 2)}</div>
        </div>
      ))
  },
)

function Demo() {
  const [random, setRandom] = React.useState<undefined | number>(undefined)

  return (
    <>
      <button onClick={() => setRandom(Math.random)}>cover some props</button>
      <CoverableComponent
        normalProp={random ?? 0}
        // modify the configuration through the coverable prop
        coverable={
          !random
            ? {}
            : {
                config1: {
                  a: {
                    b: {
                      c: {
                        d: random,
                      },
                      f: 66,
                    },
                  },
                  test: {
                    c: 2,
                  },
                },
                config2: {
                  foo: String(random),
                },
              }
        }
      />
    </>
  )
}

export default Demo
```

## LICENSE

MIT

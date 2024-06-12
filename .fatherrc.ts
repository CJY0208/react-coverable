import { defineConfig } from 'father'

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  cjs: {
    output: 'lib',
    platform: 'browser',
    transformer: 'babel',
  },
  esm: {
    output: 'es',
    platform: 'browser',
    transformer: 'babel',
  },

  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: '@fexd/tools',
        camel2DashComponentName: false,
        libraryDirectory: 'es',
      },
      '@fexd/tools',
    ],
  ],
})

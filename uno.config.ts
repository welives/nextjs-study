import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
} from 'unocss'
import presetAnimations from 'unocss-preset-animations'

export default defineConfig({
  // 使用静态编译的方式生成组件的样式,解决服务端组件无法热更新样式的问题
  cli: {
    entry: {
      patterns: ['**/*.tsx'],
      outFile: 'src/styles/uno-cli.css'
    },
  },
  presets: [
    presetUno({
      dark: 'media',
    }),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetAnimations(),
  ],
  transformers: [
    transformerDirectives(),
  ],
  shortcuts: [
    {
      'absolute-center': 'absolute top-1/2 left-1/2 -translate-1/2',
      'flex-center': 'flex justify-center items-center',
      'flex-col-center': 'flex flex-col justify-center items-center',
    }
  ]
})

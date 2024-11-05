import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  PresetUnoTheme,
  toEscapedSelector
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
      'no-bar-container': 'scrollbar-hide overflow-x-hidden overflow-y-auto w-full h-full'
    }
  ],
  rules: [
    [
      /^scrollbar-hide$/,
      ([_], { rawSelector }) => {
        const selector = toEscapedSelector(rawSelector)
        return `${selector}::-webkit-scrollbar{display:none}`
      },
    ],
  ],
  extendTheme: (theme: PresetUnoTheme) => {
    theme.colors = {
      ...theme.colors,
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    }
    theme.borderRadius = {
      ...theme.borderRadius,
      xl: 'calc(var(--radius) + 4px)',
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    }
  },
})

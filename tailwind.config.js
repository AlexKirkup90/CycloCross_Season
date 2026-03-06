export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1F3D',
          light: '#1a2f57',
          dark: '#080f1e',
        },
        sky: {
          DEFAULT: '#38BDF8',
          light: '#7DD3FC',
          dark: '#0EA5E9',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F4F7FB',
          tertiary: '#E8EFF8',
        },
        border: {
          DEFAULT: '#D1DDF0',
          strong: '#A8BDD6',
        },
        text: {
          primary: '#0F1F3D',
          secondary: '#4A5E7A',
          muted: '#8A9BB5',
        },
        phase: {
          foundation: '#8B5CF6',
          base: '#3B82F6',
          build: '#F97316',
          peak: '#EF4444',
          taper: '#22C55E',
          recovery: '#6B7280',
        },
      },
    },
  },
  plugins: [],
}

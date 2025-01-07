/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 拓展颜色，使用：text-soft，
      // https://www.tailwindcss.cn/docs/customizing-colors#using-custom-colors
      colors: {
        soft: 'var(--vt-c-white-soft)',
      },
      // 拓展高度，使用：h-600
      height: {
        600: '600px',
      },
    },
  },
  plugins: [],
}

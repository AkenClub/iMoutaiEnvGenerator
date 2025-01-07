/**
 * PostCSS配置，vite 会默认使用此配置
 * https://cn.vite.dev/guide/features#postcss
 */
export default {
  plugins: {
    // 可以不用 cssnano，因为 vite 默认压缩 css。
    // 增加 tailwindcss 才会编译 vue 等文件中 tailwindcss 的 class。
    tailwindcss: {},
    // autoprefixer 会根据 browsers 选项添加浏览器前缀。
    autoprefixer: {},
  },
}

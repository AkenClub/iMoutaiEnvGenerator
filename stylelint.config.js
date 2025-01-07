export default {
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json'],
  extends: [
    // Stylelint 标准共享配置
    'stylelint-config-standard',
    // 扩展 stylelint-config-recommended 共享配置并为 SCSS 配置其规则
    'stylelint-config-standard-scss',
    // 扩展 stylelint-config-recommended 共享配置并为 Vue 配置其规则
    'stylelint-config-standard-vue/scss',
    // 提供优化样式顺序的配置，https://github.com/stormwarning/stylelint-config-recess-order
    'stylelint-config-recess-order',
    // 基于 prettier 代码风格的 stylelint 规则
    'stylelint-prettier/recommended',
    // stylelint15 已经不用设置 'stylelint-config-prettier',
  ],
  // 指定不同文件对应的解析器
  overrides: [
    {
      files: ['**/*.{vue,html}'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.{css,scss}'],
      customSyntax: 'postcss-scss',
    },
  ],
  plugins: [],
  // 自定义规则
  rules: {
    // 不检查类名命名规则，兼容 BEM 形式
    'selector-class-pattern': null,
    // 兼容小程序单位
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
  },
}

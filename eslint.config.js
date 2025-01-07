import antfu from '@antfu/eslint-config'

/**
 * @description eslint配置
 * https://github.com/antfu/eslint-config
 *
 * 需要 IDE 开启 ESLint 插件，不用 prettier 配置，禁用保存 format 相关插件，使用 ESLint 检查。
 * 一般 IDE 的 ESLint 默认没有检查 scss 等格式文件，可以按需加上
 */
export default antfu({
  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  ignores: ['src/typings', 'src/typings/**'],
  // Use external formatters to format files that ESLint cannot handle yet (.css, .html, etc).
  formatters: true,
  // Or customize the stylistic rules
  stylistic: {
    // 格式化的更多配置 https://eslint.style/rules
  },
  // TypeScript and Vue are auto-detected, you can also explicitly enable them:
  typescript: true,
  vue: true,
  // 额外配置
  rules: {
    'no-console': 'off',
  },
})

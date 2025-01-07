/*
* lint-staged 是一个专门用于在通过 git 提交代码之前，对暂存区的代码执行一系列的格式化。
* 当 lint-staged 配合 git hooks 使用时，可以在 git 提交前的 hook 中加入 lint-staged 命令，
* 这样就能在提交代码之前，对即将提交的代码进行格式化，成功之后就会提交代码
* */

export default {
  '*.{vue,css,scss,postcss,less,html}': ['stylelint --fix'],
  '*': 'eslint --fix',
}

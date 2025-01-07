// commitlint 是一个 git commit 校验约束工具。检查提交的信息是否符合标准
// ✨提交说明的结构如下所示：
// <类型>([可选的作用域]): <描述>
// 例如：feat(login): add login function
//
//   [可选的正文]
//
//   [可选的脚注]
// -----------------
export default {
  extends: [
    // https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
    '@commitlint/config-conventional',
  ],
  rules: {
    // 可自定义规则，会覆盖上面 extends 对应项
    'type-enum': [
      2,
      'always',
      [
        // 新特性、新功能
        'feat',
        // 修复 bug
        'fix',
        // 优化相关，比如提升性能、体验
        'perf',
        // 样式相关
        'style',
        // 文档修改
        'docs',
        // 添加确实测试或更正现有的测试
        'test',
        // 代码重构，既不修复错误也不添加功能
        'refactor',
        // 编译相关的修改，例如发布版本、对项目构建或者依赖的改动
        'build',
        // 自动化流程配置或脚本修改
        'ci',
        // 其他修改, 比如改变构建流程、或者增加依赖库、工具等
        'chore',
        // 回滚到上一个版本
        'revert',
        // 版本发布
        'release',
      ],
    ],
  },
}

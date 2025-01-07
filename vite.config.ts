import path from 'node:path'
import node from 'node:process'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

import { defineConfig, loadEnv } from 'vite'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, node.cwd())
  console.log('运行环境:', env)
  const isProdMode = mode === 'production'

  return {
    server: {
      port: 12999,
      open: false,
      proxy: {
        '/api': {
          // target: env.VITE_PROXY_BASE_URL,
          changeOrigin: true,
        },
      },
    },

    resolve: {
      alias: {
        '@': pathSrc,
      },
    },

    // vite 默认使用 esbuild。如果换成使用 terser 需要另外安装依赖。
    esbuild: {
      // 生产环境删除 console 和 debugger
      drop: isProdMode ? ['console', 'debugger'] : [],
    },

    plugins: [
      vue(),
      // 自动导入 API，例如在 script 中就不用导入 ref，就能直接使用
      AutoImport({
        include: [
          /\.[jt]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        imports: ['vue', 'vue-router'],
        resolvers: [
          // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
          ElementPlusResolver(),
        ],
        // 用于 TS
        dts: path.resolve(pathSrc, 'typings', 'auto-imports.d.ts'),
        vueTemplate: true,
      }),
      // 自动导入组件，可以在模板中直接写组件，不用 import
      Components({
        resolvers: [
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver(
            // https://github.com/antfu/unplugin-icons#auto-importing
            {
              // {prefix}-{collection}-{icon}
              // 默认前缀为 i，在 Element 图标前面加 IEp 加图标名 即可自动导入，例如 IEpStar
              // prefix: 'icon',  // false 表示不用前缀
              // 自动添加 @iconify-json/ep 包，ep 代表 ElementPlus
              // https://element-plus.org/zh-CN/component/icon.html
              enabledCollections: ['ep'],
              // 自动导入自定义的图标集合，默认前缀下，为 IMine 加图标文件名，例如 IMineArrow
              customCollections: ['mine'],
            },
          ),
        ],
        dts: path.resolve(pathSrc, 'typings', 'components.d.ts'),
      }),
      Icons({
        autoInstall: true,
        // vue/compiler-sfc 包对 vue3 支持
        compiler: 'vue3',
        customCollections: {
          // 设置自定义的 SVG 目录，可以自动生成组件，可以配合上面自动导入
          mine: FileSystemIconLoader('./src/assets/svg', (svg) => {
            if (!svg) {
              console.error('Invalid SVG content')
              return '<svg></svg>' // 返回一个空的 SVG 作为兜底
            }

            try {
              svg = svg
                // svg 文件最好去除宽高，框架会自动处理
                // 去除 svg 已经存在的 fill 和 stroke
                .replace(/\s*(width|height|fill|stroke)=".*?"/g, '')
                // 添加 fill="currentColor"，让 svg 颜色跟随传入的颜色
                .replace(/^<svg /, '<svg fill="currentColor" ')
              return svg
            }
            catch (error) {
              console.error('Error processing SVG:', error)
              return '<svg></svg>' // 返回一个空的 SVG 作为兜底
            }
          }),
        },
      }),
    ],
  }
})

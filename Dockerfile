# ==============================================================================
# 1. 前端构建阶段 (frontend-builder)
# ==============================================================================
FROM node:18-alpine AS frontend-builder
WORKDIR /src

# 启用 Corepack 以使用项目定义的 Yarn 版本
RUN corepack enable

# 复制所有项目文件到工作目录
COPY . .

# 使用 mount 来缓存前端依赖并进行安装
# 移除了 --immutable-cache，允许在缓存未命中时从网络下载依赖
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --immutable

# 运行构建命令
RUN yarn build-only

# ==============================================================================
# 2. 服务端依赖阶段 (backend-deps)
# ==============================================================================
FROM node:18-alpine AS backend-deps
WORKDIR /app/server

# 启用 Corepack
RUN corepack enable

# 复制后端的 package.json 和 yarn.lock 文件
# [重要建议]: 请在你的 server/ 目录下生成并提交 yarn.lock 文件
COPY server/package.json server/yarn.lock* ./

# 只安装生产环境的服务端依赖
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --production --immutable

# ==============================================================================
# 3. 最终镜像阶段
# ==============================================================================
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app

# 从服务端依赖阶段复制必要文件
COPY --from=backend-deps /app/server/node_modules ./server/node_modules
COPY --from=backend-deps /app/server/package.json ./server/package.json
# 如果你为后端生成了 yarn.lock，也建议一并复制
COPY --from=backend-deps /app/server/yarn.lock* ./server/

# 复制后端应用代码
COPY server/app.js ./server/

# 从前端构建阶段复制构建产物
COPY --from=frontend-builder /src/dist ./dist

EXPOSE 12999
CMD ["node", "server/app.js"]
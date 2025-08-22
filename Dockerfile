# ==============================================================================
# 1. 前端构建阶段 (frontend-builder)
#
# 优化说明:
# - 修正了指令顺序，先复制所有源代码，再安装依赖，以解决 "Couldn't find the
#   node_modules state file" 错误。
# - 将所有 COPY 指令合并，以减少镜像层数。
# ==============================================================================
FROM node:18-alpine AS frontend-builder
WORKDIR /src

# 启用 Corepack 以使用项目定义的 Yarn 版本
RUN corepack enable

# 复制所有项目文件到工作目录
# 这一步必须在 yarn install 之前，以避免源码覆盖安装状态文件
COPY . .

# 使用 mount 来缓存前端依赖并进行安装
# 此时安装是基于完整的项目代码，确保了构建环境的正确性
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --immutable --immutable-cache

# 运行构建命令
# 注意：这里不再需要重复挂载缓存，因为依赖已经安装完毕
RUN yarn build-only

# ==============================================================================
# 2. 服务端依赖阶段 (backend-deps)
#
# 优化说明:
# - 建议在 server/ 目录下也创建并提交 yarn.lock 文件。
# - 修改了 COPY 指令，使其能同时复制 yarn.lock 文件。
# - 这可以确保后端依赖版本的一致性，并加快安装速度。
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
    yarn install --production --immutable --immutable-cache

# ==============================================================================
# 3. 最终镜像阶段
#
# 优化说明:
# - 添加了对后端 yarn.lock 文件的复制，保持一致性。
# - 结构保持不变，确保只打包运行时的必要文件，减小镜像体积。
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
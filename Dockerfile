# 前端构建阶段
FROM node:18-alpine AS frontend-builder
WORKDIR /src

# 使用 mount 来缓存前端依赖
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile

# 复制前端源代码并构建
COPY . .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn build-only

# 服务端依赖阶段
FROM node:18-alpine AS backend-deps
WORKDIR /app/server
COPY server/package.json ./

# 只安装服务端依赖
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --production --frozen-lockfile

# 最终阶段
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app

# 只复制必要文件
COPY --from=backend-deps /app/server/node_modules ./server/node_modules
COPY --from=backend-deps /app/server/package.json ./server/package.json
COPY server/app.js ./server/
COPY --from=frontend-builder /src/dist ./dist

EXPOSE 12999
CMD ["node", "server/app.js"] 
# 部署指南 (Docker)

本项目已配置为使用 Docker 和 Docker Compose 进行容器化部署。

## 准备工作
- 已安装 Docker
- 已安装 Docker Compose

## 项目结构
- **Dockerfile**: 采用多阶段构建 (依赖安装 -> 构建 -> 运行)，优化镜像体积。
- **docker-compose.yml**: 编排服务，并负责持久化 SQLite 数据库。
- **.dockerignore**: 排除不必要的文件，加快构建速度。

## 部署步骤

### 1. 构建并启动
在项目根目录下运行以下命令：
```bash
docker-compose up -d --build
```

### 2. 访问服务
服务启动后，可以通过浏览器访问 `http://localhost:3000`。

### 3. 数据库持久化
SQLite 数据库文件 (`dev.db`) 位于 `./prisma` 目录下。
该目录已挂载到容器内的 `/app/prisma`。
- **重要**: 请确保您的服务器本地存在 `prisma/dev.db` 文件。如果是全新部署，容器启动时可能没有数据库文件。
- **初始化** (如果是全新环境):
  如果 `dev.db` 不存在，您需要在容器内或本地运行迁移命令来生成它。
  *本地运行*: `npx prisma db push`
  *容器内运行*: `docker-compose exec gym-lite npx prisma db push`

### 4. 环境变量
请修改 `docker-compose.yml` 或新建一个 `.env` 文件来设置敏感信息，例如 `SESSION_SECRET`。

## 常见问题排查
- 如果遇到数据库错误，请检查 `./prisma` 文件夹的权限，确保 Docker 用户有权读写 `dev.db`。

---

## 进阶：部署预构建镜像

如果您更喜欢在本地构建好镜像后推送到服务器（而不是在服务器上现场构建），可以使用以下两种方法：

### 方案 A：使用镜像仓库（推荐）
**1. 本地：打标签并推送**
```bash
# 登录 Docker Hub (或阿里云镜像仓库)
docker login

# 给本地镜像打标签 (请将 'yourusername' 替换为您的 Docker Hub 用户名)
docker tag gym-lite-local yourusername/gym-lite:latest

# 推送到仓库
docker push yourusername/gym-lite:latest
```

**2. 服务器：拉取并运行**
修改服务器上的 `docker-compose.yml`，使用 `image` 替代 `build`：
```yaml
services:
  gym-lite:
    # build: .  <-- 注释掉这一行
    image: yourusername/gym-lite:latest # <-- 添加这一行
    container_name: gym-lite
    # ... 其他配置保持不变
```
然后运行：
```bash
docker-compose up -d
```

### 方案 B：离线包传输 (Save/Load)
**1. 本地：保存镜像为文件**
```bash
# 将镜像保存为 tar 文件 (并使用 gzip 压缩)
docker save gym-lite-local | gzip > gym-lite.tar.gz

# 上传到服务器 (使用 scp)
scp gym-lite.tar.gz username@server-ip:/home/username/
```

**2. 服务器：加载镜像**
```bash
# 加载镜像
docker load < gym-lite.tar.gz

# 修改 docker-compose.yml 使用本地镜像名
# services:
#   gym-lite:
#     image: gym-lite-local
#     # build: .
```
然后运行：
```bash
docker-compose up -d
```

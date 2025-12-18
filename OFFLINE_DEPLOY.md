# 🚀 GymLite 离线部署完全指南

此文档专为**本地开发环境 (Windows/Mac)** 到 **Linux 服务器** 的离线镜像部署设计。
无需在服务器上安装 Node.js 或进行构建，所有依赖都在本地打包完成。

## 📋 核心流程
1. **构建**: 在本地生成兼容 Linux 的镜像。
2. **打包**: 将镜像导出为单一文件。
3. **传输**: 将文件发送到服务器。
4. **加载**: 服务器导入镜像。
5. **启动**: 使用 Docker Compose 运行。

---

## 🛠️ 第一步：本地构建与打包

请在项目根目录 (包含 `Dockerfile` 的文件夹) 打开终端 (PowerShell 或 Cmd)。

### 1. 跨平台构建镜像
即使你的电脑是 Windows/Mac，我们也强制构建 `linux/amd64` 架构的镜像，确保在服务器上能跑。

```powershell
docker build --platform linux/amd64 -t gym-lite-local .
```

### 2. 导出镜像为文件
将构建好的镜像保存为 `.tar` 文件。

```powershell
docker save -o gym-lite.tar gym-lite-local
```
*(注：这里生成的 `gym-lite.tar` 可能会有 200MB+，这是正常的)*

### 3. 传输到服务器
使用 `scp` 命令上传。`-C` 参数开启压缩传输，能在网速慢时节省时间。

```powershell
# 请替换 IP 地址
scp -C gym-lite.tar root@47.114.97.201:/home/ubuntu/my-gym-app/
```

*(同时，别忘了把 `docker-compose.yml` 也传上去，如果服务器上还没有的话)*
```powershell
scp docker-compose.yml root@47.114.97.201:/home/ubuntu/my-gym-app/
```

---

## ☁️ 第二步：服务器端操作

使用 SSH 登录服务器，进入上传目录。

### 1. 确保目录整洁 (可选)
如果之前跑过，建议先停止旧容器。
```bash
cd /home/ubuntu/my-gym-app
docker compose down
```

### 2. 加载镜像
将上传的 tar 包恢复为 Docker 镜像。
```bash
docker load -i gym-lite.tar
```
*成功后会显示 `Loaded image: gym-lite-local:latest`*

### 3. 准备/检查 docker-compose.yml
确保服务器上的 `docker-compose.yml` 使用的是**镜像模式**而不是**构建模式**。
你可以用 `nano docker-compose.yml` 查看或修改：

```yaml
services:
  gym-lite:
    container_name: gym-lite
    image: gym-lite-local:latest  # <--- 关键：必须指向刚才加载的镜像名
    # build: .                    # <--- 关键：这一行必须注释掉或删除
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./prisma:/app/prisma      # 数据库持久化
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=change-this-secret-key-in-production
```

### 4. 启动服务
```bash
docker compose up -d
```

### 5. 查看状态与日志
```bash
# 查看容器是否活着
docker compose ps

# 查看实时日志 (按 Ctrl+C 退出)
docker compose logs -f
```

---

## 🔄 以后如何更新？
当你修改了代码 (比如修复了 Bug 或改了 UI)：

1. **本地**: 再次执行 **第一步** 的 3 个命令 (Build -> Save -> SCP)。
2. **服务器**: 再次执行 **第二步** 的 Load 和 Up 命令。
   ```bash
   docker load -i gym-lite.tar
   docker compose down
   docker compose up -d
   
   # ⚠️ 关键步骤：如果这次更新修改了数据库结构 (比如加了新表)
   # 必须执行这行命令来同步数据库，否则会报错！
   docker compose exec gym-lite npx prisma db push
   ```
   *(Docker 会自动检测到镜像 ID 变了，并使用新代码重新创建容器)*

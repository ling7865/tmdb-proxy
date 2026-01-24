# TMDB 代理 Worker

一个基于 Cloudflare Workers 的 TMDB API 代理服务，用于解决影视库刮削工具的 TMDB 访问问题。支持完整的 API 代理和图片代理功能。

## ✨ 功能特性

- 🔄 **完整 API 代理**：无缝代理所有 TMDB API 请求
- 🖼️ **图片代理支持**：代理 TMDB 图片资源，解决图片无法加载问题
- 🌐 **CORS 支持**：完整解决浏览器跨域问题
- 🔒 **安全认证**：保护您的 TMDB API 密钥
- ⚡ **全球加速**：基于 Cloudflare 全球边缘网络
- 💾 **智能缓存**：可配置的缓存策略，减少 API 调用

## 🚀 快速部署

### 前置要求

- [x] Cloudflare 账户
- [x] TMDB API 密钥（[申请地址](https://www.themoviedb.org/settings/api)）
- [x] GitHub 账户

### 一键部署

1. **Fork 本仓库**
2. **配置 GitHub Secrets**：
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     - `CLOUDFLARE_API_TOKEN`：Cloudflare API 令牌，请选择Cloudflare Workers 模板
     - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账户 ID（可选）
     - `TMDB_API_KEY`：您的 TMDB API 密钥

3. **自动部署**：推送代码到 main 分支将自动触发部署

### 手动部署

```bash
# 克隆项目
git clone https://github.com/your-username/tmdb-proxy-worker.git
cd tmdb-proxy-worker

# 安装依赖
npm install -g wrangler

# 配置环境变量
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export TMDB_API_KEY="your-tmdb-api-key"

# 部署
wrangler deploy
```

## 📖 使用方法

### 基础 URL

部署成功后，您可以在worker处设置自定义域，若保持默认，您的 Worker 地址为：
```
https://your-worker-name.your-subdomain.workers.dev
```

### API 代理示例

**获取电影信息**
```
GET /movie/550
```

**搜索电影**
```
GET /search/movie?query=avatar
```

**获取电视剧信息**
```
GET /tv/1399
```

### 图片代理示例

**海报图片**
```
GET /image/t/p/w500/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg
```

**背景图片**
```
GET /image/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg
```

**简化路径**
```
GET /image/w500/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg
```

## 🔧 刮削工具配置

### Jellyfin

1. 进入 **控制台** → **插件** → **TheMovieDb**
2. 配置：
   - API 地址：`https://您的worker.workers.dev`
   - 图片地址：`https://您的worker.workers.dev/image`

### TinyMediaManager

1. **Settings** → **Movies** → **TheMovieDb**
2. 配置：
   - API URL：`https://您的worker.workers.dev`
   - 图片基础 URL：`https://您的worker.workers.dev/image`

### Emby

1. 进入 **管理** → **高级** → **神医助手插件** → **元数据增强**（请自行安装神医助手）
2. 修改 API 服务器地址为您的 Worker URL

### Plex

使用 [TMDBMetaDataAgent](https://github.com/ZeroQI/TMDBMetaDataAgent.bundle) 插件，配置代理地址。

## ⚙️ 配置说明

### 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `TMDB_API_KEY` | TMDB API 密钥 | ✅ |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 令牌 | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | ✅ |

### wrangler.toml 配置

```toml
name = "tmdb-proxy"
compatibility_date = "2024-01-01"
main = "worker.js"

# 自定义域名（可选）
routes = [
  "tmdb.yourdomain.com/*"
]

# 环境变量（通过 GitHub Secrets 设置）
[env.production.vars]
TMDB_API_KEY = "{{ secrets.TMDB_API_KEY }}"
```

## 🛠️ 开发指南

### 本地开发

```bash
# 启动开发服务器
wrangler dev

# 监听模式
wrangler dev --live-reload

# 查看日志
wrangler tail
```

### 项目结构

```
tmdb-proxy-worker/
├── worker.js              # Worker 主逻辑
├── wrangler.toml          # 配置文件
├── package.json           # 依赖配置（可选）
├── .github/
│   └── workflows/
│       └── deploy.yml     # 自动部署工作流
└── README.md              # 项目文档
```

## 🐛 故障排除

### 常见问题

**❌ 部署失败：权限错误**
```bash
# 检查令牌权限
wrangler whoami
```

**❌ API 返回 401 错误**
- 检查 TMDB API 密钥是否正确
- 验证环境变量配置

**❌ 图片无法加载**
- 检查图片代理路径格式
- 验证图片 URL 是否可公开访问

**❌ 速率限制错误**
- TMDB 限制：30-40 请求/10秒
- 建议添加缓存减少调用

### 日志查看

```bash
# 实时日志
wrangler tail

# 特定环境日志
wrangler tail --env production
```

## 🔄 工作流优化

部署工作流已优化，只在代码文件更改时触发：

```yaml
on:
  push:
    branches: [ main ]
    paths:
      - 'worker.js'
      - 'wrangler.toml'
      - 'package.json'
```

README 更新不会触发不必要的部署。

## 📊 监控和维护

### 性能监控

1. **Cloudflare Dashboard**：查看请求量、错误率
2. **TMDB 账户**：监控 API 使用情况
3. **GitHub Actions**：检查部署状态

### 维护建议

- 定期更新 TMDB API 密钥
- 监控 API 调用频率
- 更新 Worker 代码以兼容 API 变更

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/新功能`
3. 提交更改：`git commit -m '添加新功能'`
4. 推送分支：`git push origin feature/新功能`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ⚠️ 免责声明

本项目仅用于学习和研究目的，请遵守：
- [TMDB API 使用条款](https://www.themoviedb.org/documentation/api/terms-of-use)
- Cloudflare Workers 服务条款
- 当地法律法规

## 🆘 获取帮助

- [提交 Issue](https://github.com/your-username/tmdb-proxy-worker/issues)
- [TMDB API 文档](https://developers.themoviedb.org/3)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

---

**如果这个项目对您有帮助，请给个 ⭐️ 支持一下！**



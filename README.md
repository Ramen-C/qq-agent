# qq-agent

一个基于 `Vue 3 + Vite + Pinia + TypeScript + Sass` 的 QQ 风格 Web Demo。

当前版本已经不再只是静态前端壳，还包含：

- QQ 风格登录页与体验账号登录
- 同域 `/api/auth/*` 登录会话接口
- 同域 `/api/shrimp/read-segment` 小虾分析接口
- 本地 `vite` 开发态复用同一套服务端 handler
- Vercel 部署配置与腾讯云上游中转预留

## 开发

在仓库根目录执行：

```bash
npm install
npm run dev
```

`npm run dev` 会同时提供前端页面和本地同域 API，默认地址为 `http://127.0.0.1:9527/`。

更完整的部署与环境变量说明维护在比赛工作区的 `docs/` 目录中；本仓库只保留可运行 Demo 本体。

## 验证

```bash
npm run typecheck
npm run test
npm run build
```

## Vercel 形态

如果要按最终部署形态本地验证，可在仓库根目录执行：

```bash
npm run dev:vercel
```

首次运行需要先登录 Vercel CLI。

Vercel 在当前项目里的推荐角色是“前端 + 同域轻量 API + 腾讯云上游中转入口”，而不是唯一主后端。部署细节、项目根目录设置和冒烟清单维护在比赛工作区的 `docs/` 目录中。

## 环境变量

可参考 [`.env.example`](./.env.example) 配置：

- 体验账号与 Cookie 密钥
- 腾讯云上游中转地址与 Token
- 小虾分析上游路径

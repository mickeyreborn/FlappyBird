# Cocos MCP Server 配置模板

本仓库 **不提交** 实际 MCP 配置（见 `.gitignore`）：

- `.cursor/` — Cursor MCP 连接
- `extensions/` — Cocos MCP 扩展本体

请从 `docs/templates/` 复制到本地使用。模板文件可提交 Git，供团队参考。

---

## 前置条件（每个 Cocos 项目做一次）

1. 在项目的 `extensions/` 安装 **cocos-mcp-server**（商城或复制源码后 `npm install && npm run build`）。
2. 用 Cocos Creator 打开该工程。
3. 菜单 **扩展 → Cocos MCP Server** 打开面板，点击 **启动服务器**。
4. 浏览器访问 `http://127.0.0.1:<端口>/health`，应返回正常。

---

## 场景一：单项目（推荐入门）

**适用**：一次只开一个 Cocos 工程 + 一个 Cursor 工作区。

### 1. Cocos 端口 — `settings/mcp-server.json`

复制：

```bash
cp docs/templates/mcp-server.single.json settings/mcp-server.json
```

内容：

```json
{
  "port": 3000,
  "autoStart": false,
  "debugLog": false,
  "maxConnections": 10
}
```

> `settings/mcp-server.json` 可随项目提交；若团队统一用 3000，提交无妨。仅个人改端口时可加入 `.gitignore`。

### 2. Cursor 连接 — `.cursor/mcp.json`

```bash
mkdir -p .cursor
cp docs/templates/mcp.cursor.single.json .cursor/mcp.json
```

内容：

```json
{
  "mcpServers": {
    "cocos-creator": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### 3. 使用顺序

1. 打开 Cocos Creator（本项目）→ 启动 MCP（端口 **3000**）。
2. Cursor 打开本项目文件夹 → 设置里启用 MCP `cocos-creator`。
3. 在对话中让 AI 操作场景/资源。

### 4. 可选：Cursor 用户级共用（仍只连当前 Creator）

若所有 Cocos 项目都用 3000，且**从不同时开两个 Creator**，可在 Cursor **用户设置** 里配置同一条 `http://localhost:3000/mcp`，不必每个仓库放 `.cursor/mcp.json`。

---

## 场景二：多项目并行

**适用**：同时打开多个 Cocos Creator 窗口（不同工程）。

**原则**：每个工程 **一个端口**；Cursor 工作区的 `mcp.json` 端口必须与 **当前正在编辑的那个 Creator 工程** 一致。

### 端口分配表示例


| 项目文件夹      | Cocos `settings/mcp-server.json` | Cursor `.cursor/mcp.json`   |
| ---------- | -------------------------------- | --------------------------- |
| FlappyBird | 3000                             | `http://localhost:3000/mcp` |
| MyGame2    | 3001                             | `http://localhost:3001/mcp` |
| MyGame3    | 3002                             | `http://localhost:3002/mcp` |


### 1. 新项目 B 的 Cocos 配置

复制多项目模板并改端口（示例 3001）：

```bash
# 在 MyGame2 仓库根目录
cp docs/templates/mcp-server.multi.json settings/mcp-server.json
# 编辑 port 为 3001（若模板已是 3001 则跳过）
```

`settings/mcp-server.json`：

```json
{
  "port": 3001,
  "autoStart": false,
  "debugLog": false,
  "maxConnections": 10
}
```

### 2. 新项目 B 的 Cursor 配置

```bash
mkdir -p .cursor
cp docs/templates/mcp.cursor.multi.json .cursor/mcp.json
# 确认 url 里端口与 settings 一致（3001）
```

`.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "cocos-creator": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

### 3. FlappyBird（本仓库）保持 3000

```bash
mkdir -p .cursor
cp docs/templates/mcp.cursor.single.json .cursor/mcp.json
cp docs/templates/mcp-server.single.json settings/mcp-server.json
```

### 4. 使用顺序

1. Creator 打开 **FlappyBird** → MCP 启动在 **3000**。
2. Creator 打开 **MyGame2** → MCP 启动在 **3001**（若 EADDRINUSE，说明端口冲突，改未占用端口）。
3. Cursor 打开 **FlappyBird** 文件夹 → 连 3000；切换到 **MyGame2** 工作区 → 连 3001。

**不要**在两个 Creator 里都用 3000。

---

## 故障排查


| 现象                  | 处理                                                                  |
| ------------------- | ------------------------------------------------------------------- |
| `EADDRINUSE` / 端口占用 | 换 `settings/mcp-server.json` 的 `port`，并同步改 `.cursor/mcp.json` 的 URL |
| Cursor 连不上 MCP      | 确认 Creator 已打开对应工程且 MCP 已启动；浏览器测 `/health`                          |
| AI 改错项目             | 端口与当前 Cursor 工作区不一致；或 Creator 开的是另一个工程                              |
| clone 后无 MCP        | `extensions/` 被 ignore，需重新安装扩展并 `npm run build`                     |


---

## 文件对照


| 文件                             | 是否提交 Git | 模板路径                                                              |
| ------------------------------ | -------- | ----------------------------------------------------------------- |
| `.cursor/mcp.json`             | 否        | `docs/templates/mcp.cursor.single.json` / `mcp.cursor.multi.json` |
| `settings/mcp-server.json`     | 可选       | `docs/templates/mcp-server.single.json` / `mcp-server.multi.json` |
| `extensions/cocos-mcp-server/` | 否        | 每项目本地安装                                                           |


---

## 一键复制（FlappyBird 单项目）

```bash
mkdir -p .cursor
cp docs/templates/mcp-server.single.json settings/mcp-server.json
cp docs/templates/mcp.cursor.single.json .cursor/mcp.json
```

然后在 Cocos Creator 中启动 MCP，重启 Cursor 或刷新 MCP 连接即可。
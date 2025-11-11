# hybrid-editor

> 简易上手的下一代混合排版编辑器：同时支持富文本、矢量绘制与自由绘图，自动实现文本环绕与自适应布局。

## ✨ 项目概览

- **目标**：提供一个可在浏览器中运行、简易的混合编辑器，统一支持段落文本、矢量图形绘制与自由绘图。
- **布局特性**：通过排版引擎实现文字与图形的实时环绕、自适应和响应式布局。
- **发布计划**：
  - 作为开源项目托管在 GitHub。
  - 以 `hybrid-editor` 包名发布到 npm。

## 🔍 与类似项目的对比

目前开源社区中，**同时支持富文本编辑、矢量绘制、自由绘图，并实现文字环绕图形的混合排版编辑器**较为稀缺。以下是一些相关但功能侧重点不同的项目：

### 富文本编辑器类

- **Quill**、**Draft.js**、**Tiptap**、**Slate.js**：专注于富文本编辑，不支持矢量绘制和文字环绕图形
- **wangEditor**：轻量级富文本编辑器，功能单一

### 绘图/设计工具类

- **tldraw**、**Excalidraw**：优秀的绘图工具，但不支持富文本编辑和文字环绕
- **fabric.js**、**Konva.js**：Canvas 绘图库，需要自行实现富文本和排版逻辑
- **Inkscape**：桌面端矢量图形编辑器，非 Web 编辑器

### 页面构建器类

- **GrapesJS**：可视化页面构建器，主要面向网页布局，不专注于文字环绕图形的混合排版

### hybrid-editor 的独特定位

✅ **统一编辑体验**：在同一编辑器中无缝切换文本、矢量图形和自由绘图  
✅ **智能文字环绕**：自动计算文本流动路径，实现文字环绕矢量图和手绘内容  
✅ **零第三方依赖**：核心实现不依赖任何第三方包，轻量且可控  
✅ **简易上手**：提供简洁的 API 和直观的交互，降低使用门槛

> 如果你知道其他类似项目，欢迎通过 Issue 补充！

## 🚀 功能特性（规划）

- 富文本编辑：标题、段落、列表、行内格式、快捷键。
- 矢量绘制：矩形、椭圆、多边形、贝塞尔路径，支持节点编辑与渐变填充。
- 自由绘图：压感/速度平滑，图层管理，橡皮擦与撤销重做。
- 混合排版：文本绕排矢量图形与自由绘制内容，自适应布局，网格/对齐线辅助。

## 🏗️ 技术架构（初步设想）

- **核心编辑内核**：状态管理与命令系统，无需第三方依赖。
- **渲染层**：结合 Canvas 与 SVG，针对不同节点类型选择最优渲染方式。
- **排版引擎**：构建矢量与自由绘制图层的包围盒（shape exclusion path），计算文本流动。

> 以上为初步设计，实际实现会在项目推进中逐步细化与迭代。

## 📦 安装与使用

```bash
# 使用 npm
npm install hybrid-editor

# 或使用 yarn
yarn add hybrid-editor

# 或使用 pnpm
pnpm add hybrid-editor
```

```ts
import { HybridEditor } from 'hybrid-editor';

const editor = new HybridEditor({
  target: document.getElementById('editor'),
  locale: 'zh-CN',
  features: ['rich-text', 'vector', 'freehand'],
});

editor.mount();
```

> 上述 API 处于规划阶段，具体内容将在首个可用版本推出时补充。

## 🧰 开发指南

```bash
# 克隆仓库
git clone https://github.com/<your-org>/hybrid-editor.git
cd hybrid-editor

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 运行测试
pnpm test

# 构建发布包
pnpm build
```

- **开发本项目时**：仅支持使用 pnpm（>=8.0.0）管理依赖，请确保已安装 pnpm。
- **用户安装本包时**：可以使用 npm、yarn 或 pnpm 任意包管理器安装。
- 代码风格遵循 ESLint + Prettier 规则，提交代码前会自动进行格式化和校验。

## 📁 项目结构（拟定）

```
hybrid-editor/
├─ packages/
│  ├─ core/         # 编辑器内核：数据模型、命令系统、协作
│  ├─ renderer/     # Canvas/SVG 渲染抽象
│  └─ ui/           # 组件与工具面板
├─ examples/        # 演示与集成案例
├─ docs/            # 文档与设计规范
└─ scripts/         # 构建、发布脚本
```

> 随着开发推进，结构可能会调整，以 README 中的最新版本为准。

## 🛣️ 开发路线图

- [ ] 搭建基础项目脚手架与构建流程。
- [ ] 实现富文本编辑核心功能。
- [ ] 打通矢量绘制与数据模型。
- [ ] 完成文本与图形混排算法。
- [ ] 提供首个公开预览版本（Alpha）。
- [ ] 发布 npm 包并开放项目文档站点。

欢迎通过 Issue 或 Discussion 参与路线图讨论。

## 🤝 贡献指南

1. Fork 仓库并新建分支：`feature/your-feature` 或 `fix/issue-id`。
2. 确保通过单元测试与 lint 检查。
3. 提交 Pull Request 时附上变更说明与相关截图/录屏。

我们鼓励贡献代码、文档、设计以及使用反馈。

## 📄 许可证

计划采用 MIT License（待仓库初始化时确认）。

---

如果你对混合排版、富文本与矢量绘制的结合感兴趣，欢迎关注项目进展或加入贡献者行列！

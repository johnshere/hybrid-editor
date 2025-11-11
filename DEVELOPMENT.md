# 开发指南

## 🚀 快速开始

### 安装依赖

```bash
# 开发本项目时，仅支持使用 pnpm（>=8.0.0）
pnpm install
```

> ⚠️ **注意**：此限制仅针对**开发本项目**时。用户安装 `hybrid-editor` 包时可以使用 npm、yarn 或 pnpm 任意包管理器。

### 开发模式

启动开发服务器（运行示例）：

```bash
pnpm dev
```

### 构建

构建生产版本（生成 ESM 和 CommonJS 两种格式）：

```bash
pnpm build
```

构建产物：

- `dist/index.js` - ESM 格式（现代模式）
- `dist/index.cjs` - CommonJS 格式（传统模式）
- `dist/index.d.ts` - TypeScript 类型声明文件

### 测试

运行单元测试：

```bash
pnpm test
```

运行测试并查看覆盖率：

```bash
pnpm test:coverage
```

使用 UI 界面运行测试：

```bash
pnpm test:ui
```

### 代码格式化

格式化代码：

```bash
pnpm format
```

检查代码格式：

```bash
pnpm format:check
```

### 代码检查

运行 ESLint：

```bash
pnpm lint
```

自动修复问题：

```bash
pnpm lint:fix
```

类型检查：

```bash
pnpm type-check
```

## 📁 项目结构

```
hybrid-editor/
├── src/              # 源代码
│   ├── index.ts      # 主入口文件
│   └── *.test.ts     # 测试文件
├── examples/         # 示例和演示
├── dist/             # 构建输出（gitignore）
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
├── rollup.config.ts  # Rollup 构建配置
├── vite.config.ts    # Vite 开发配置
└── vitest.config.ts  # Vitest 测试配置
```

## 🛠️ 技术栈

- **TypeScript** - 类型安全
- **Rollup** - 库打包（支持 ESM 和 CommonJS）
- **Vite** - 开发服务器
- **Vitest** - 单元测试框架
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Husky** - Git hooks 管理
- **lint-staged** - 提交时代码校验

## 🔒 Git Hooks 和代码校验

项目配置了 Husky + lint-staged，在提交代码时会自动：

1. **ESLint 检查**：检查 TypeScript 代码规范
2. **Prettier 格式化**：自动格式化代码
3. **类型检查**：确保类型正确

如果代码不符合规范，提交会被阻止。请先运行 `pnpm lint:fix` 和 `pnpm format` 修复问题后再提交。

## 📦 发布

发布到 npm：

```bash
npm publish
```

> 注意：发布前会自动运行 `prepublishOnly` 脚本进行构建。

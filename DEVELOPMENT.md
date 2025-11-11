# 开发指南

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
# 或
npm install
```

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

## 📦 发布

发布到 npm：

```bash
npm publish
```

> 注意：发布前会自动运行 `prepublishOnly` 脚本进行构建。


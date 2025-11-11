# 项目初始化说明

## 📋 首次设置步骤

1. **安装依赖**

```bash
pnpm install
```

2. **初始化 Husky Git Hooks**

```bash
pnpm prepare
```

这会自动设置 Git hooks，确保提交代码时自动进行格式化和校验。

3. **验证配置**

```bash
# 检查代码格式
pnpm format:check

# 运行 lint
pnpm lint

# 运行测试
pnpm test
```

## ✅ 完成

现在你可以开始开发了！

- 运行 `pnpm dev` 启动开发服务器
- 提交代码时会自动进行格式化和校验
- 使用 `pnpm format` 手动格式化代码
- 使用 `pnpm lint:fix` 自动修复 lint 问题

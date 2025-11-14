/**
 * 样式入口文件
 * 导入 SCSS 文件，在构建时会被编译为 CSS
 * 构建后会生成 dist/styles.js 文件，导出 styles 字符串
 */

// 导入组件库 UI 样式（工具栏、属性面板、容器等）
// 开发时：Vite 会自动处理 SCSS 文件
// 构建时：rollup-plugin-postcss 会处理 SCSS 并生成独立的 CSS 文件和 styles.js
import './ui.scss';

// 导入渲染层样式（渲染容器、文本层、矢量层、Canvas层）
import './renderer.scss';

// 开发时的占位符导出
// 构建时，rollup 会生成 dist/styles.js 文件，其中包含编译后的 CSS 内容
// 在生产环境中，styles 会从 dist/styles.js 导入（通过构建配置处理）
export const uiStyles = '';
export const rendererStyles = '';

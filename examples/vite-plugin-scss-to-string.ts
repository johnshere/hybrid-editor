import { Plugin } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sass from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vite 插件：在开发环境中将 SCSS 编译为 CSS 字符串
 */
export function scssToString(): Plugin {
  const uiScssPath = resolve(__dirname, '../packages/styles/ui.scss');
  const rendererScssPath = resolve(__dirname, '../packages/styles/renderer.scss');

  return {
    name: 'scss-to-string',
    transform(code: string, id: string) {
      // 处理 packages/styles/index.ts 文件
      // 使用更通用的路径匹配
      const normalizedId = id.replace(/\\/g, '/');
      if (
        normalizedId.includes('packages/styles/index.ts') ||
        normalizedId.endsWith('styles/index.ts')
      ) {
        // 读取并编译 UI 样式
        try {
          const stylesDir = resolve(__dirname, '../packages/styles');
          // 使用新的 compile API 直接编译文件
          const uiResult = sass.compile(uiScssPath, {
            style: 'compressed',
            loadPaths: [stylesDir],
          });
          const uiCssContent = uiResult.css;

          // 读取并编译渲染层样式
          const rendererResult = sass.compile(rendererScssPath, {
            style: 'compressed',
            loadPaths: [stylesDir],
          });
          const rendererCssContent = rendererResult.css;

          // 替换样式导出
          let newCode = code;
          newCode = newCode.replace(
            /export const uiStyles = ['"]?['"]?;/,
            `export const uiStyles = ${JSON.stringify(uiCssContent)};`
          );
          newCode = newCode.replace(
            /export const rendererStyles = ['"]?['"]?;/,
            `export const rendererStyles = ${JSON.stringify(rendererCssContent)};`
          );

          return {
            code: newCode,
            map: null,
          };
        } catch (error) {
          console.warn('Failed to compile SCSS in dev mode:', error);
          return null;
        }
      }
      return null;
    },
    handleHotUpdate(ctx) {
      // 当 SCSS 文件变化时，触发 styles/index.ts 的重新处理
      const normalizedFile = ctx.file.replace(/\\/g, '/');
      if (
        normalizedFile.includes('packages/styles/ui.scss') ||
        normalizedFile.includes('packages/styles/renderer.scss') ||
        normalizedFile.includes('packages/styles/_bem.scss')
      ) {
        // 查找所有已加载的模块，找到 styles/index.ts 模块
        const moduleGraph = ctx.server.moduleGraph;
        const affectedModules: any[] = [];

        // 遍历所有模块，找到 styles/index.ts 及其依赖者
        moduleGraph.urlToModuleMap.forEach((mod, url) => {
          const normalizedUrl = url.replace(/\\/g, '/');
          if (
            normalizedUrl.includes('packages/styles/index.ts') ||
            normalizedUrl.includes('packages/index.ts') ||
            normalizedUrl.includes('packages/renderer/index.ts')
          ) {
            affectedModules.push(mod);
          }
        });

        if (affectedModules.length > 0) {
          return affectedModules;
        }
      }
    },
  };
}

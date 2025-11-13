import { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sass from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vite 插件：在开发环境中将 SCSS 编译为 CSS 字符串
 */
export function scssToString(): Plugin {
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
        // 读取 SCSS 文件
        const scssPath = resolve(__dirname, '../packages/styles/index.scss');
        try {
          const scssContent = readFileSync(scssPath, 'utf-8');
          // 编译 SCSS 为 CSS
          const result = sass.compileString(scssContent, {
            style: 'compressed',
          });
          const cssContent = result.css;
          // 替换 styles 导出
          const newCode = code.replace(
            /export const styles = ['"]?['"]?;/,
            `export const styles = ${JSON.stringify(cssContent)};`
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
  };
}

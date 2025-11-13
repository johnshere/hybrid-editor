import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type OutputBundle, type OutputAsset } from 'rollup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 自定义插件：将 CSS 内容导出为 JS 字符串
const exportCssAsString = () => {
  return {
    name: 'export-css-as-string',
    generateBundle(_options, bundle: OutputBundle) {
      // 查找生成的 CSS 文件
      const cssAsset = Object.values(bundle).find(
        (chunk): chunk is OutputAsset => chunk.type === 'asset' && chunk.fileName === 'index.css'
      );
      if (cssAsset) {
        // 将 CSS 内容导出为 JS 模块
        this.emitFile({
          type: 'asset',
          fileName: 'styles.js',
          source: `export const styles = ${JSON.stringify(cssAsset.source)};`,
        });
      }
    },
  };
};

// 自定义插件：将 CSS 内容内联到 JS 中（替换 packages/styles/index.ts 中的 styles 导出）
const inlineCssStyles = () => {
  return {
    name: 'inline-css-styles',
    transform(code: string, id: string) {
      // 如果是 packages/styles/index.ts 文件，替换 styles 导出
      // 使用更通用的路径匹配
      const normalizedId = id.replace(/\\/g, '/');
      if (
        normalizedId.includes('packages/styles/index.ts') ||
        normalizedId.endsWith('styles/index.ts')
      ) {
        // 总是重新读取 CSS 文件，确保获取最新内容
        const cssPath = resolve(__dirname, 'dist/index.css');
        let currentCssContent = '';
        try {
          currentCssContent = readFileSync(cssPath, 'utf-8');
        } catch (error) {
          console.warn('Failed to read CSS file:', error);
          return null;
        }
        if (currentCssContent) {
          const newCode = code.replace(
            /export const styles = ['"]?['"]?;/,
            `export const styles = ${JSON.stringify(currentCssContent)};`
          );
          return {
            code: newCode,
            map: null,
          };
        }
      }
      return null;
    },
  };
};

export default defineConfig([
  // CSS 构建（生成独立的压缩 CSS 文件）
  {
    input: 'packages/styles/index.scss',
    output: {
      file: 'dist/index.css',
    },
    plugins: [
      postcss({
        extract: true,
        minimize: true,
        plugins: [autoprefixer(), cssnano()],
        sourceMap: false,
        // 提取 CSS 到文件
        onExtract: () => {
          return true; // 继续提取到文件
        },
      }),
      exportCssAsString(),
    ],
  },
  // ESM 构建（现代模式）
  {
    input: 'packages/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      postcss({
        extract: false,
        inject: false,
        minimize: false, // 在主构建中不压缩，因为 CSS 已经在单独的构建中处理
        plugins: [],
        sourceMap: false,
      }),
      inlineCssStyles(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
      terser({
        compress: {
          drop_console: false, // 保留 console，可根据需要调整
          drop_debugger: true,
        },
        format: {
          comments: false, // 移除注释
        },
      }),
    ],
  },
  // CommonJS 构建（传统模式）
  {
    input: 'packages/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      postcss({
        extract: false,
        inject: false,
        minimize: false, // 在主构建中不压缩，因为 CSS 已经在单独的构建中处理
        plugins: [],
        sourceMap: false,
      }),
      inlineCssStyles(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
      terser({
        compress: {
          drop_console: false, // 保留 console，可根据需要调整
          drop_debugger: true,
        },
        format: {
          comments: false, // 移除注释
        },
      }),
    ],
  },
]);

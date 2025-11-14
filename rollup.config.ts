import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type OutputBundle, type OutputAsset } from 'rollup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 自定义插件：将 CSS 内容导出为 JS 字符串
const exportCssAsString = () => {
  return {
    name: 'export-css-as-string',
    writeBundle(_options, bundle: OutputBundle) {
      // 在渲染层 CSS 构建时，读取两个 CSS 文件并生成 styles.js
      const rendererCssAsset = Object.values(bundle).find(
        (chunk): chunk is OutputAsset => chunk.type === 'asset' && chunk.fileName === 'renderer.css'
      );

      if (rendererCssAsset) {
        // 读取之前生成的 UI CSS 文件（此时文件已经写入）
        const uiCssPath = resolve(__dirname, 'dist/ui.css');
        let uiCssContent = '';
        try {
          uiCssContent = readFileSync(uiCssPath, 'utf-8');
        } catch (error) {
          console.warn('Failed to read UI CSS file:', error);
        }

        // 将 CSS 内容导出为 JS 模块
        const uiStyles = uiCssContent ? JSON.stringify(uiCssContent) : '""';
        const rendererStyles = JSON.stringify(rendererCssAsset.source);

        // writeBundle 中需要直接写入文件
        const stylesJsPath = resolve(__dirname, 'dist/styles.js');
        writeFileSync(
          stylesJsPath,
          `export const uiStyles = ${uiStyles};\nexport const rendererStyles = ${rendererStyles};`
        );
      }
    },
  };
};

// 自定义插件：将 CSS 内容内联到 JS 中（替换 packages/styles/index.ts 中的样式导出）
const inlineCssStyles = () => {
  return {
    name: 'inline-css-styles',
    transform(code: string, id: string) {
      // 如果是 packages/styles/index.ts 文件，替换样式导出
      // 使用更通用的路径匹配
      const normalizedId = id.replace(/\\/g, '/');
      if (
        normalizedId.includes('packages/styles/index.ts') ||
        normalizedId.endsWith('styles/index.ts')
      ) {
        // 读取 UI CSS 文件
        const uiCssPath = resolve(__dirname, 'dist/ui.css');
        let uiCssContent = '';
        try {
          uiCssContent = readFileSync(uiCssPath, 'utf-8');
        } catch (error) {
          console.warn('Failed to read UI CSS file:', error);
        }

        // 读取渲染层 CSS 文件
        const rendererCssPath = resolve(__dirname, 'dist/renderer.css');
        let rendererCssContent = '';
        try {
          rendererCssContent = readFileSync(rendererCssPath, 'utf-8');
        } catch (error) {
          console.warn('Failed to read renderer CSS file:', error);
        }

        let newCode = code;
        if (uiCssContent) {
          newCode = newCode.replace(
            /export const uiStyles = ['"]?['"]?;/,
            `export const uiStyles = ${JSON.stringify(uiCssContent)};`
          );
        }
        if (rendererCssContent) {
          newCode = newCode.replace(
            /export const rendererStyles = ['"]?['"]?;/,
            `export const rendererStyles = ${JSON.stringify(rendererCssContent)};`
          );
        }

        return {
          code: newCode,
          map: null,
        };
      }
      return null;
    },
  };
};

export default defineConfig([
  // UI 样式构建（生成独立的压缩 CSS 文件）
  {
    input: 'packages/styles/ui.scss',
    output: {
      file: 'dist/ui.css',
    },
    plugins: [
      postcss({
        extract: true,
        minimize: true,
        plugins: [autoprefixer(), cssnano()],
        sourceMap: false,
        onExtract: () => {
          return true;
        },
      }),
    ],
  },
  // 渲染层样式构建（生成独立的压缩 CSS 文件）
  {
    input: 'packages/styles/renderer.scss',
    output: {
      file: 'dist/renderer.css',
    },
    plugins: [
      postcss({
        extract: true,
        minimize: true,
        plugins: [autoprefixer(), cssnano()],
        sourceMap: false,
        onExtract: () => {
          return true;
        },
      }),
      exportCssAsString(), // 在最后一个 CSS 构建中生成 styles.js
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

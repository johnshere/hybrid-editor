import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

export default defineConfig([
  // ESM 构建（现代模式）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
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
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
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

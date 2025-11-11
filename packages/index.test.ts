import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HybridEditor } from './index';

describe('HybridEditor', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-editor';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('应该能够通过 HTMLElement 创建实例', () => {
    const editor = new HybridEditor({
      target: container,
    });
    expect(editor).toBeInstanceOf(HybridEditor);
  });

  it('应该能够通过选择器字符串创建实例', () => {
    const editor = new HybridEditor({
      target: '#test-editor',
    });
    expect(editor).toBeInstanceOf(HybridEditor);
  });

  it('应该在使用无效选择器时抛出错误', () => {
    expect(() => {
      new HybridEditor({
        target: '#non-existent',
      });
    }).toThrow('Target element not found');
  });

  it('应该使用默认配置', () => {
    const editor = new HybridEditor({
      target: container,
    });
    editor.mount();
    // 验证默认配置已应用
    expect(editor).toBeDefined();
  });

  it('应该接受自定义配置', () => {
    const editor = new HybridEditor({
      target: container,
      locale: 'en-US',
      features: ['rich-text'],
    });
    expect(editor).toBeInstanceOf(HybridEditor);
  });
});

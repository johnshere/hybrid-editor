/**
 * hybrid-editor
 * 简易上手的下一代混合排版编辑器
 */

export interface HybridEditorOptions {
  /** 挂载的目标元素 */
  target: HTMLElement | string;
  /** 语言设置 */
  locale?: string;
  /** 启用的功能模块 */
  features?: ('rich-text' | 'vector' | 'freehand')[];
}

/**
 * HybridEditor 主类
 */
export class HybridEditor {
  private target: HTMLElement;
  private options: Required<HybridEditorOptions>;

  constructor(options: HybridEditorOptions) {
    if (typeof options.target === 'string') {
      const element = document.querySelector<HTMLElement>(options.target);
      if (!element) {
        throw new Error(`Target element not found: ${options.target}`);
      }
      this.target = element;
    } else {
      this.target = options.target;
    }

    this.options = {
      target: this.target,
      locale: options.locale || 'zh-CN',
      features: options.features || ['rich-text', 'vector', 'freehand'],
    };
  }

  /**
   * 挂载编辑器
   */
  mount(): void {
    // TODO: 实现编辑器挂载逻辑
    console.log('HybridEditor mounted', this.options);
  }

  /**
   * 卸载编辑器
   */
  unmount(): void {
    // TODO: 实现编辑器卸载逻辑
    console.log('HybridEditor unmounted');
  }
}

// 默认导出
export default HybridEditor;


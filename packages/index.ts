/**
 * hybrid-editor
 * 简易上手的下一代混合排版编辑器
 */

// 导出核心模块
export * from './core';

// 导出渲染模块
export * from './renderer';

// 导出 UI 模块
export * from './ui';

// 导出工具模块
export * from './utils';

import { StateManager, CommandManager, type EditorState, type DocumentNode } from './core';
import { RendererFactory, type Renderer } from './renderer';
import { Toolbar, PropertyPanel, zhCN } from './ui';
import type { InternalLocale, Locale, ToolbarConfig } from './ui';
import { deepMerge } from './utils';

/**
 * HybridEditor 内部选项类型（locale 已合并为完整对象）
 */
interface InternalHybridEditorOptions {
  el: HTMLElement;
  locale: InternalLocale;
  /** 启用的功能模块 */
  features: ('rich-text' | 'vector' | 'freehand')[];
  /** 渲染器类型 */
  rendererType: 'canvas' | 'svg';
  /** 工具栏配置 */
  toolbarConfig?: ToolbarConfig;
}

export interface HybridEditorOptions extends Omit<InternalHybridEditorOptions, 'el' | 'locale'> {
  /** 挂载的目标元素 */
  el: HTMLElement | string;
  /** 语言设置 */
  locale?: Locale;
}

/**
 * HybridEditor 主类
 */
export class HybridEditor {
  private el: HTMLElement;
  private shadowRoot: ShadowRoot | null = null;
  private editorContainer: HTMLElement | null = null;
  private options: InternalHybridEditorOptions;
  private stateManager: StateManager;
  private commandManager: CommandManager;
  private renderer: Renderer;
  private toolbar: Toolbar | null = null;
  private propertyPanel: PropertyPanel | null = null;

  constructor(options: HybridEditorOptions) {
    if (typeof options.el === 'string') {
      const element = document.querySelector<HTMLElement>(options.el);
      if (!element) {
        throw new Error(`Target element not found: ${options.el}`);
      }
      this.el = element;
    } else {
      this.el = options.el;
    }

    this.options = {
      el: this.el,
      locale: deepMerge(options.locale || {}, zhCN),
      features: options.features || ['rich-text', 'vector', 'freehand'],
      rendererType: options.rendererType || 'canvas',
      toolbarConfig: options.toolbarConfig,
    };

    // 初始化核心模块
    this.stateManager = new StateManager();
    this.commandManager = new CommandManager();

    // 初始化渲染器
    this.renderer = RendererFactory.create(this.options.rendererType);
  }

  /**
   * 挂载编辑器
   */
  mount(): void {
    // 创建 Shadow DOM 实现样式隔离
    this.shadowRoot = this.el.attachShadow({ mode: 'closed' });

    // 注入编辑器样式到 Shadow DOM
    this.injectStyles();

    // 创建编辑器主容器
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'hybrid-editor-container';
    this.shadowRoot.appendChild(this.editorContainer);

    // 初始化渲染器（使用 Shadow DOM 内的容器）
    this.renderer.init(this.editorContainer);

    // 创建工具栏（组件内部会自动创建容器并挂载）
    this.toolbar = new Toolbar(this.editorContainer, {
      ...this.options.toolbarConfig,
      locale: this.options.locale,
    });

    // 创建属性面板（组件内部会自动创建容器并挂载）
    this.propertyPanel = new PropertyPanel(this.editorContainer, this.options.locale);

    // 订阅状态变化
    this.stateManager.subscribe((state: EditorState) => {
      // 状态变化时重新渲染
      this.renderer.clear();
      state.content.forEach((node: DocumentNode) => {
        this.renderer.renderNode(node);
      });
    });

    console.log('HybridEditor mounted');
  }

  /**
   * 注入编辑器样式到 Shadow DOM
   */
  private injectStyles(): void {
    if (!this.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = `
      /* 编辑器容器样式 */
      .hybrid-editor-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        color: #333;
        background-color: #fff;
      }

      /* 工具栏样式 */
      .hybrid-editor-toolbar {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }

      /* 工具栏 fixed 定位（移动端） */
      .hybrid-editor-toolbar.toolbar-fixed {
        position: fixed;
        left: 0;
        right: 0;
        z-index: 1000;
      }

      .hybrid-editor-toolbar.toolbar-fixed.toolbar-position-top {
        top: 0;
      }

      .hybrid-editor-toolbar.toolbar-fixed.toolbar-position-bottom {
        bottom: 0;
      }

      /* 一层工具栏 */
      .toolbar-layer-1 {
        display: flex;
        justify-content: center;
        padding: 8px 0;
      }

      /* 二层工具栏 */
      .toolbar-layer-2 {
        display: none;
        justify-content: center;
        padding: 8px 0;
      }

      /* 工具栏在上方时，二层显示在一层下方 */
      .toolbar-position-top .toolbar-layer-2 {
        padding-top: 0;
      }

      /* 工具栏在下方时，二层显示在一层上方 */
      .toolbar-position-bottom .toolbar-layer-2 {
        padding-bottom: 0;
      }

      /* 工具按钮样式 */
      .hybrid-editor-toolbar .tool-button,
      .hybrid-editor-toolbar .category-button {
        padding: 6px 12px;
        border: 1px solid #d0d0d0;
        border-right: none;
        border-radius: 0;
        background-color: #fff;
        color: #333;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        white-space: nowrap;
        margin: 0;
      }

      /* 第一个按钮左侧圆角 */
      .hybrid-editor-toolbar .tool-button:first-child,
      .hybrid-editor-toolbar .category-button:first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }

      /* 最后一个按钮右侧有 border 和圆角 */
      .hybrid-editor-toolbar .tool-button:last-child,
      .hybrid-editor-toolbar .category-button:last-child {
        border-right: 1px solid #d0d0d0;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      .hybrid-editor-toolbar .tool-button:hover,
      .hybrid-editor-toolbar .category-button:hover {
        background-color: #f0f0f0;
        border-color: #b0b0b0;
      }

      .hybrid-editor-toolbar .tool-button:hover + .tool-button,
      .hybrid-editor-toolbar .tool-button:hover + .category-button,
      .hybrid-editor-toolbar .category-button:hover + .tool-button,
      .hybrid-editor-toolbar .category-button:hover + .category-button {
        border-left-color: #b0b0b0;
      }

      .hybrid-editor-toolbar .tool-button.active,
      .hybrid-editor-toolbar .category-button.active {
        background-color: #007bff;
        color: #fff;
        border-color: #007bff;
      }

      .hybrid-editor-toolbar .tool-button.active + .tool-button,
      .hybrid-editor-toolbar .tool-button.active + .category-button,
      .hybrid-editor-toolbar .category-button.active + .tool-button,
      .hybrid-editor-toolbar .category-button.active + .category-button {
        border-left-color: #007bff;
      }

      .hybrid-editor-toolbar .tool-button.active:last-child,
      .hybrid-editor-toolbar .category-button.active:last-child {
        border-right-color: #007bff;
      }

      .hybrid-editor-toolbar .tool-button:active,
      .hybrid-editor-toolbar .category-button:active {
        transform: scale(0.95);
      }

      /* 分类按钮特殊样式 */
      .hybrid-editor-toolbar .category-button {
        font-weight: 500;
      }

      /* 属性面板样式 */
      .hybrid-editor-property-panel {
        padding: 12px;
        border-top: 1px solid #e0e0e0;
        background-color: #fafafa;
        flex-shrink: 0;
      }

      .hybrid-editor-property-panel .property-panel {
        color: #666;
        font-size: 13px;
      }

      /* Canvas/SVG 容器样式 */
      canvas,
      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  /**
   * 卸载编辑器
   */
  unmount(): void {
    // 销毁渲染器
    this.renderer.destroy();

    // 清理 UI 组件
    if (this.toolbar) {
      // TODO: 清理工具栏
    }
    if (this.propertyPanel) {
      // TODO: 清理属性面板
    }

    // 清理 Shadow DOM
    if (this.shadowRoot) {
      // 清空 Shadow DOM 内容
      this.shadowRoot.innerHTML = '';
      this.shadowRoot = null;
    }

    // 清空宿主元素（Shadow DOM 被清空后，宿主元素也会被清空）
    this.el.innerHTML = '';
    this.editorContainer = null;

    console.log('HybridEditor unmounted');
  }

  /**
   * 获取状态管理器
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }

  /**
   * 获取命令管理器
   */
  getCommandManager(): CommandManager {
    return this.commandManager;
  }

  /**
   * 获取渲染器
   */
  getRenderer(): Renderer {
    return this.renderer;
  }
}

// 默认导出
export default HybridEditor;

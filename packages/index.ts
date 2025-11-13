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
import { styles } from './styles';

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
    style.textContent = styles;
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

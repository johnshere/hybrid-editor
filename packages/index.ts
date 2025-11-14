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
import { deepMerge, b } from './utils';
import { uiStyles } from './styles';

/**
 * HybridEditor 内部选项类型（locale 已合并为完整对象）
 */
interface InternalHybridEditorOptions {
  el: HTMLElement;
  locale: InternalLocale;
  /** 启用的功能模块 */
  features: ('rich-text' | 'vector' | 'freehand')[];
  /** 渲染器类型：'hybrid' 使用混合渲染器（推荐），'canvas' 或 'svg' 用于向后兼容 */
  rendererType: 'hybrid' | 'canvas' | 'svg';
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
      rendererType: options.rendererType || 'hybrid',
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
    // 注入组件库 UI 样式到主文档
    this.injectUIStyles();

    // 创建编辑器主容器（不使用 Shadow DOM，只有渲染层使用 Shadow DOM）
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = b('container');
    this.el.appendChild(this.editorContainer);

    // 初始化渲染器（渲染器内部会创建 Shadow DOM）
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
   * 注入组件库 UI 样式到主文档
   */
  private injectUIStyles(): void {
    // 检查是否已经注入过样式
    if (document.getElementById('he-ui-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'he-ui-styles';
    style.textContent = uiStyles;
    document.head.appendChild(style);
  }

  /**
   * 卸载编辑器
   */
  unmount(): void {
    // 销毁渲染器（会清理 Shadow DOM）
    this.renderer.destroy();

    // 清理 UI 组件
    if (this.toolbar) {
      // TODO: 清理工具栏
    }
    if (this.propertyPanel) {
      // TODO: 清理属性面板
    }

    // 清空宿主元素
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

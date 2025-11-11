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

import { StateManager, CommandManager, type EditorState, type DocumentNode } from './core';
import { RendererFactory, type Renderer } from './renderer';
import { Toolbar, PropertyPanel } from './ui';

export interface HybridEditorOptions {
  /** 挂载的目标元素 */
  target: HTMLElement | string;
  /** 语言设置 */
  locale?: string;
  /** 启用的功能模块 */
  features?: ('rich-text' | 'vector' | 'freehand')[];
  /** 渲染器类型 */
  rendererType?: 'canvas' | 'svg';
}

/**
 * HybridEditor 主类
 */
export class HybridEditor {
  private target: HTMLElement;
  private options: Required<HybridEditorOptions>;
  private stateManager: StateManager;
  private commandManager: CommandManager;
  private renderer: Renderer;
  private toolbar: Toolbar | null = null;
  private propertyPanel: PropertyPanel | null = null;

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
      rendererType: options.rendererType || 'canvas',
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
    // 初始化渲染器
    this.renderer.init(this.target);

    // 创建工具栏容器
    const toolbarContainer = document.createElement('div');
    toolbarContainer.className = 'hybrid-editor-toolbar';
    this.target.appendChild(toolbarContainer);
    this.toolbar = new Toolbar(toolbarContainer);
    this.toolbar.render();

    // 创建属性面板容器
    const propertyPanelContainer = document.createElement('div');
    propertyPanelContainer.className = 'hybrid-editor-property-panel';
    this.target.appendChild(propertyPanelContainer);
    this.propertyPanel = new PropertyPanel(propertyPanelContainer);
    this.propertyPanel.render();

    // 订阅状态变化
    this.stateManager.subscribe((state: EditorState) => {
      // 状态变化时重新渲染
      this.renderer.clear();
      state.content.forEach((node: DocumentNode) => {
        this.renderer.renderNode(node);
      });
    });

    console.log('HybridEditor mounted', this.options);
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

    // 清空容器
    this.target.innerHTML = '';

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

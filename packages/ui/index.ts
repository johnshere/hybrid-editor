/**
 * ui - 用户界面
 * 组件与工具面板
 */
export * from './locale';

import { DeepPartial } from '../types/utils';
import { deepMerge, isMobileDevice } from '../utils';
import { zhCN, type InternalLocale } from './locale';

const isMobile = isMobileDevice();

// 辅助工具
export type AuxiliaryTool = 'drag' | 'select' | 'zoom';
// 文本工具
export type TextTool = 'fontSize' | 'fontColor' | 'bold' | 'italic' | 'underline' | 'strikethrough';
// 图形工具
export type ShapeTool = 'line' | 'rectangle' | 'ellipse' | 'polygon';
// 绘制工具
export type DrawTool = 'pen' | 'penSize' | 'eraser';
// 分类按钮
export type CategoryButton = 'text' | 'shape' | 'draw';
// 所有工具按钮类型
export type ToolbarButton = AuxiliaryTool | TextTool | ShapeTool | DrawTool | CategoryButton;
export type ToolbarPosition = 'bottom' | 'top';

// 工具分类定义
export const ToolCategories = {
  auxiliary: ['drag', 'select', 'zoom'] as AuxiliaryTool[],
  text: ['fontSize', 'fontColor', 'bold', 'italic', 'underline', 'strikethrough'] as TextTool[],
  shape: ['line', 'rectangle', 'ellipse', 'polygon'] as ShapeTool[],
  draw: ['pen', 'penSize', 'eraser'] as DrawTool[],
} as const;

type InternalToolbarConfig = {
  tools: ToolbarButton[];
  fixed: boolean;
  position: ToolbarPosition;
  locale: InternalLocale;
};
export type ToolbarConfig = DeepPartial<InternalToolbarConfig>;

const defaultToolbarConfig: InternalToolbarConfig = {
  tools: ['drag', 'select', 'zoom', 'text', 'shape', 'draw'],
  fixed: isMobile,
  position: isMobile ? 'bottom' : 'top',
  locale: zhCN,
};

/**
 * 工具栏
 */
export class Toolbar {
  private container: HTMLElement;
  private layer1Container: HTMLElement; // 一层容器
  private layer2Container: HTMLElement; // 二层容器
  private config: InternalToolbarConfig;
  private activeTool: ToolbarButton = 'select';
  private activeCategory: CategoryButton | null = null; // 当前激活的分类
  private toolChangeListeners: Set<(tool: ToolbarButton) => void> = new Set();

  constructor(parentContainer: HTMLElement, config: ToolbarConfig | undefined) {
    // 创建主容器
    this.container = document.createElement('div');
    this.container.className = 'hybrid-editor-toolbar';
    parentContainer.appendChild(this.container);

    // 创建一层容器
    this.layer1Container = document.createElement('div');
    this.layer1Container.className = 'toolbar-layer-1';

    // 创建二层容器
    this.layer2Container = document.createElement('div');
    this.layer2Container.className = 'toolbar-layer-2';

    this.config = deepMerge({ ...defaultToolbarConfig }, config);

    // 根据位置决定容器顺序
    if (this.config.position === 'top') {
      this.container.appendChild(this.layer1Container);
      this.container.appendChild(this.layer2Container);
    } else {
      this.container.appendChild(this.layer2Container);
      this.container.appendChild(this.layer1Container);
    }

    // 自动渲染
    this.render();
  }

  /**
   * 渲染工具栏
   */
  render(): void {
    this.renderLayer1();
    this.renderLayer2();
    this.updateContainerClass();
  }

  /**
   * 渲染一层工具栏（辅助工具 + 分类按钮）
   */
  private renderLayer1(): void {
    this.layer1Container.innerHTML = '';

    // 渲染辅助工具
    ToolCategories.auxiliary.forEach((tool) => {
      if (this.isToolEnabled(tool)) {
        const button = this.createToolButton(tool);
        this.layer1Container.appendChild(button);
      }
    });

    // 渲染分类按钮
    const categories: CategoryButton[] = ['text', 'shape', 'draw'];
    categories.forEach((category) => {
      if (this.isToolEnabled(category)) {
        const button = this.createCategoryButton(category);
        this.layer1Container.appendChild(button);
      }
    });
  }

  /**
   * 渲染二层工具栏（分类下的具体工具）
   */
  private renderLayer2(): void {
    this.layer2Container.innerHTML = '';

    if (!this.activeCategory) {
      this.layer2Container.style.display = 'none';
      return;
    }

    this.layer2Container.style.display = 'flex';

    let tools: ToolbarButton[] = [];
    switch (this.activeCategory) {
      case 'text':
        tools = ToolCategories.text;
        break;
      case 'shape':
        tools = ToolCategories.shape;
        break;
      case 'draw':
        tools = ToolCategories.draw;
        break;
    }

    tools.forEach((tool) => {
      const button = this.createToolButton(tool);
      this.layer2Container.appendChild(button);
    });
  }

  /**
   * 创建工具按钮
   */
  private createToolButton(tool: ToolbarButton): HTMLElement {
    const button = document.createElement('button');
    button.textContent = this.getToolLabel(tool);
    button.className = `tool-button ${tool === this.activeTool ? 'active' : ''}`;
    button.addEventListener('click', () => this.selectTool(tool));
    return button;
  }

  /**
   * 创建分类按钮
   */
  private createCategoryButton(category: CategoryButton): HTMLElement {
    const button = document.createElement('button');
    button.textContent = this.getToolLabel(category);
    button.className = `category-button ${category === this.activeCategory ? 'active' : ''}`;
    button.addEventListener('click', () => this.selectCategory(category));
    return button;
  }

  /**
   * 选择分类
   */
  private selectCategory(category: CategoryButton): void {
    // 如果点击已激活的分类，则关闭二层
    if (this.activeCategory === category) {
      this.activeCategory = null;
    } else {
      this.activeCategory = category;
    }
    this.render();
  }

  /**
   * 选择工具
   */
  selectTool(tool: ToolbarButton): void {
    // 如果选择的是分类按钮，不处理
    if (tool === 'text' || tool === 'shape' || tool === 'draw') {
      return;
    }

    this.activeTool = tool;
    this.render();
    this.notifyToolChange(tool);
  }

  /**
   * 更新容器类名（根据位置和 fixed 状态）
   */
  private updateContainerClass(): void {
    const classes = ['hybrid-editor-toolbar', `toolbar-position-${this.config.position}`];
    if (this.config.fixed) {
      classes.push('toolbar-fixed');
    }
    this.container.className = classes.join(' ');
  }

  /**
   * 检查工具是否启用
   */
  private isToolEnabled(tool: ToolbarButton): boolean {
    return this.config.tools.includes(tool);
  }

  /**
   * 获取当前选中的工具
   */
  getActiveTool(): ToolbarButton {
    return this.activeTool;
  }

  /**
   * 订阅工具变化
   */
  onToolChange(listener: (tool: ToolbarButton) => void): () => void {
    this.toolChangeListeners.add(listener);
    return () => {
      this.toolChangeListeners.delete(listener);
    };
  }

  /**
   * 获取工具标签
   */
  private getToolLabel(tool: ToolbarButton): string {
    return this.config.locale.toolbar[tool] || tool;
  }

  /**
   * 通知工具变化
   */
  private notifyToolChange(tool: ToolbarButton): void {
    this.toolChangeListeners.forEach((listener) => listener(tool));
  }
}

/**
 * 属性面板
 */
export class PropertyPanel {
  private container: HTMLElement;
  private locale: InternalLocale;

  constructor(parentContainer: HTMLElement, locale: InternalLocale) {
    // 创建属性面板容器并挂载到父容器
    this.container = document.createElement('div');
    this.container.className = 'hybrid-editor-property-panel';
    parentContainer.appendChild(this.container);

    this.locale = locale;

    // 自动渲染
    this.render();
  }

  /**
   * 渲染属性面板
   */
  render(): void {
    // TODO: 实现属性面板渲染
    this.container.innerHTML = `<div class="property-panel">${this.locale.toolbar.select || '属性面板'}</div>`;
  }

  /**
   * 更新属性
   */
  updateProperties(_properties: Record<string, unknown>): void {
    // TODO: 实现属性更新
  }
}

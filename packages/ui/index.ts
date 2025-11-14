/**
 * ui - 用户界面
 * 组件与工具面板
 */
export * from './locale';

import type { NodeType, VectorType } from '../core';
import { DeepPartial } from '../types/utils';
import { deepMerge, isMobileDevice, b, e, m } from '../utils';
import { zhCN, type InternalLocale } from './locale';

const isMobile = isMobileDevice();

/**
 * 辅助工具类型
 */
export type AuxiliaryTool = 'drag' | 'select' | 'zoom';

/**
 * 文本工具类型
 */
export type TextTool = 'fontSize' | 'fontColor' | 'bold' | 'italic' | 'underline' | 'strikethrough';

/**
 * 图形工具类型（与 VectorType 对应，但使用更友好的命名）
 */
export type ShapeTool = 'line' | 'rect' | 'circle' | 'ellipse' | 'polygon';

/**
 * 绘制工具类型
 */
export type DrawTool = 'pen' | 'penSize' | 'eraser';

/**
 * 分类按钮类型（对应 NodeType）
 */
export type CategoryButton = 'text' | 'vector' | 'freehand';

/**
 * 所有工具按钮类型
 */
export type ToolbarButton = AuxiliaryTool | TextTool | ShapeTool | DrawTool | CategoryButton;

/**
 * 工具分类定义
 */
export const ToolCategories = {
  auxiliary: ['drag', 'select', 'zoom'] as AuxiliaryTool[],
  text: ['fontSize', 'fontColor', 'bold', 'italic', 'underline', 'strikethrough'] as TextTool[],
  shape: ['line', 'rect', 'circle', 'ellipse', 'polygon'] as ShapeTool[],
  draw: ['pen', 'penSize', 'eraser'] as DrawTool[],
} as const;

/**
 * ShapeTool 到 VectorType 的映射
 */
export const ShapeToolToVectorTypeMap: Record<ShapeTool, VectorType> = {
  line: 'line',
  rect: 'rect',
  circle: 'circle',
  ellipse: 'ellipse',
  polygon: 'polygon',
};

/**
 * CategoryButton 到 NodeType 的映射
 */
export const CategoryToNodeTypeMap: Record<CategoryButton, NodeType> = {
  text: 'text',
  vector: 'vector',
  freehand: 'freehand',
};

/**
 * 工具类型到节点类型的映射
 */
export function getNodeTypeFromTool(tool: ToolbarButton): NodeType | null {
  // 分类按钮直接映射
  if (tool === 'text' || tool === 'vector' || tool === 'freehand') {
    return CategoryToNodeTypeMap[tool];
  }

  // 图形工具映射到 vector
  if (ToolCategories.shape.includes(tool as ShapeTool)) {
    return 'vector';
  }

  // 绘制工具映射到 freehand
  if (ToolCategories.draw.includes(tool as DrawTool)) {
    return 'freehand';
  }

  // 文本工具映射到 text
  if (ToolCategories.text.includes(tool as TextTool)) {
    return 'text';
  }

  // 辅助工具不创建节点
  return null;
}

/**
 * 获取图形工具对应的矢量类型
 */
export function getVectorTypeFromShapeTool(tool: ShapeTool): VectorType {
  return ShapeToolToVectorTypeMap[tool];
}

export type ToolbarPosition = 'bottom' | 'top';

type InternalToolbarConfig = {
  tools: ToolbarButton[];
  fixed: boolean;
  position: ToolbarPosition;
  locale: InternalLocale;
};
export type ToolbarConfig = DeepPartial<InternalToolbarConfig>;

const defaultToolbarConfig: InternalToolbarConfig = {
  tools: ['drag', 'select', 'zoom', 'text', 'vector', 'freehand'],
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
    this.container.className = b('toolbar');
    parentContainer.appendChild(this.container);

    // 创建一层容器
    this.layer1Container = document.createElement('div');
    this.layer1Container.className = e('toolbar', 'layer-1');

    // 创建二层容器
    this.layer2Container = document.createElement('div');
    this.layer2Container.className = e('toolbar', 'layer-2');

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
    const categories: CategoryButton[] = ['text', 'vector', 'freehand'];
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
      case 'vector':
        tools = ToolCategories.shape;
        break;
      case 'freehand':
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
    const baseClass = e('toolbar', 'button');
    const activeClass = tool === this.activeTool ? ` ${m('toolbar', 'button', 'active')}` : '';
    button.className = `${baseClass}${activeClass}`;
    button.addEventListener('click', () => this.selectTool(tool));
    return button;
  }

  /**
   * 创建分类按钮
   */
  private createCategoryButton(category: CategoryButton): HTMLElement {
    const button = document.createElement('button');
    button.textContent = this.getToolLabel(category);
    const baseClass = e('toolbar', 'category-button');
    const activeClass =
      category === this.activeCategory ? ` ${m('toolbar', 'category-button', 'active')}` : '';
    button.className = `${baseClass}${activeClass}`;
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
    if (tool === 'text' || tool === 'vector' || tool === 'freehand') {
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
    const classes = [b('toolbar'), m('toolbar', `position-${this.config.position}`)];
    if (this.config.fixed) {
      classes.push(m('toolbar', 'fixed'));
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
    this.container.className = b('property-panel');
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
    const contentClass = e('property-panel', 'content');
    this.container.innerHTML = `<div class="${contentClass}">${this.locale.toolbar.select || '属性面板'}</div>`;
  }

  /**
   * 更新属性
   */
  updateProperties(_properties: Record<string, unknown>): void {
    // TODO: 实现属性更新
  }
}

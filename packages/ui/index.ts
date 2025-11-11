/**
 * ui - 用户界面
 * 组件与工具面板
 */

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 显示的工具 */
  tools?: ToolType[];
  /** 工具栏位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * 工具类型
 */
export type ToolType = 'select' | 'text' | 'rectangle' | 'ellipse' | 'polygon' | 'pen' | 'eraser';

/**
 * 工具栏
 */
export class Toolbar {
  private container: HTMLElement;
  private config: Required<ToolbarConfig>;
  private activeTool: ToolType = 'select';
  private toolChangeListeners: Set<(tool: ToolType) => void> = new Set();

  constructor(container: HTMLElement, config?: ToolbarConfig) {
    this.container = container;
    this.config = {
      tools: config?.tools || [
        'select',
        'text',
        'rectangle',
        'ellipse',
        'polygon',
        'pen',
        'eraser',
      ],
      position: config?.position || 'top',
    };
  }

  /**
   * 渲染工具栏
   */
  render(): void {
    this.container.innerHTML = '';
    this.config.tools.forEach((tool) => {
      const button = document.createElement('button');
      button.textContent = this.getToolLabel(tool);
      button.className = `tool-button ${tool === this.activeTool ? 'active' : ''}`;
      button.addEventListener('click', () => this.selectTool(tool));
      this.container.appendChild(button);
    });
  }

  /**
   * 选择工具
   */
  selectTool(tool: ToolType): void {
    this.activeTool = tool;
    this.render();
    this.notifyToolChange(tool);
  }

  /**
   * 获取当前选中的工具
   */
  getActiveTool(): ToolType {
    return this.activeTool;
  }

  /**
   * 订阅工具变化
   */
  onToolChange(listener: (tool: ToolType) => void): () => void {
    this.toolChangeListeners.add(listener);
    return () => {
      this.toolChangeListeners.delete(listener);
    };
  }

  /**
   * 获取工具标签
   */
  private getToolLabel(tool: ToolType): string {
    const labels: Record<ToolType, string> = {
      select: '选择',
      text: '文本',
      rectangle: '矩形',
      ellipse: '椭圆',
      polygon: '多边形',
      pen: '画笔',
      eraser: '橡皮',
    };
    return labels[tool] || tool;
  }

  /**
   * 通知工具变化
   */
  private notifyToolChange(tool: ToolType): void {
    this.toolChangeListeners.forEach((listener) => listener(tool));
  }
}

/**
 * 属性面板
 */
export class PropertyPanel {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 渲染属性面板
   */
  render(): void {
    // TODO: 实现属性面板渲染
    this.container.innerHTML = '<div class="property-panel">属性面板</div>';
  }

  /**
   * 更新属性
   */
  updateProperties(_properties: Record<string, unknown>): void {
    // TODO: 实现属性更新
  }
}

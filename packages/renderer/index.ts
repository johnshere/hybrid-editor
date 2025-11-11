/**
 * renderer - 渲染层
 * Canvas/SVG 渲染抽象
 */

import type { DocumentNode } from '../core';

/**
 * 渲染器接口
 */
export interface Renderer {
  /**
   * 初始化渲染器
   */
  init(container: HTMLElement): void;

  /**
   * 渲染节点
   */
  renderNode(node: DocumentNode): void;

  /**
   * 清除画布
   */
  clear(): void;

  /**
   * 销毁渲染器
   */
  destroy(): void;
}

/**
 * Canvas 渲染器
 */
export class CanvasRenderer implements Renderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  init(container: HTMLElement): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  renderNode(node: DocumentNode): void {
    if (!this.ctx) return;

    // TODO: 根据节点类型渲染
    switch (node.type) {
      case 'text':
        this.renderText(node);
        break;
      case 'vector':
        this.renderVector(node);
        break;
      case 'freehand':
        this.renderFreehand(node);
        break;
    }
  }

  clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }

  private renderText(_node: DocumentNode): void {
    // TODO: 实现文本渲染
  }

  private renderVector(_node: DocumentNode): void {
    // TODO: 实现矢量图形渲染
  }

  private renderFreehand(_node: DocumentNode): void {
    // TODO: 实现自由绘制渲染
  }
}

/**
 * SVG 渲染器
 */
export class SVGRenderer implements Renderer {
  private svg: SVGElement | null = null;

  init(container: HTMLElement): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', container.clientWidth.toString());
    this.svg.setAttribute('height', container.clientHeight.toString());
    container.appendChild(this.svg);
  }

  renderNode(node: DocumentNode): void {
    if (!this.svg) return;

    // TODO: 根据节点类型渲染
    switch (node.type) {
      case 'text':
        this.renderText(node);
        break;
      case 'vector':
        this.renderVector(node);
        break;
      case 'freehand':
        this.renderFreehand(node);
        break;
    }
  }

  clear(): void {
    if (this.svg) {
      while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
      }
    }
  }

  destroy(): void {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;
  }

  private renderText(_node: DocumentNode): void {
    // TODO: 实现文本渲染
  }

  private renderVector(_node: DocumentNode): void {
    // TODO: 实现矢量图形渲染
  }

  private renderFreehand(_node: DocumentNode): void {
    // TODO: 实现自由绘制渲染
  }
}

/**
 * 渲染器工厂
 */
export class RendererFactory {
  /**
   * 创建渲染器
   */
  static create(type: 'canvas' | 'svg'): Renderer {
    switch (type) {
      case 'canvas':
        return new CanvasRenderer();
      case 'svg':
        return new SVGRenderer();
      default:
        throw new Error(`Unknown renderer type: ${type}`);
    }
  }
}

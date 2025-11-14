/**
 * renderer - 渲染层
 * 混合渲染器：DOM（富文本）+ SVG（矢量图形）+ Canvas（自由绘制）
 */

import type { DocumentNode } from '../core';
import { rendererStyles } from '../styles';
import { b, e } from '../utils';

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
 * 混合渲染器
 * 根据节点类型选择不同的渲染方式：
 * - text: DOM（contenteditable）
 * - vector: SVG
 * - freehand: Canvas
 */
export class HybridRenderer implements Renderer {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null; // Shadow DOM，用于样式隔离
  private renderContainer: HTMLElement | null = null; // 渲染容器层，作为定位基准
  private textLayer: HTMLElement | null = null;
  private vectorLayer: SVGElement | null = null;
  private freehandLayer: HTMLCanvasElement | null = null;
  private freehandCtx: CanvasRenderingContext2D | null = null;
  private nodeElements: Map<string, HTMLElement | SVGElement> = new Map();

  init(container: HTMLElement): void {
    this.container = container;

    // 创建 Shadow DOM 实现样式隔离（只包裹渲染层）
    const shadowHost = document.createElement('div');
    shadowHost.className = b('render-host');
    shadowHost.style.width = '100%';
    shadowHost.style.height = '100%';
    container.appendChild(shadowHost);
    this.shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

    // 注入样式到 Shadow DOM
    this.injectStyles();

    // 创建渲染容器层（作为定位基准，包含所有渲染层）
    this.renderContainer = document.createElement('div');
    this.renderContainer.className = b('render-container');
    this.renderContainer.style.position = 'relative';
    this.renderContainer.style.width = '100%';
    this.renderContainer.style.height = '100%';
    this.renderContainer.style.overflow = 'hidden';
    this.shadowRoot.appendChild(this.renderContainer);

    // 创建文本层（DOM）
    this.textLayer = document.createElement('div');
    this.textLayer.className = b('text-layer');
    this.textLayer.style.position = 'absolute';
    this.textLayer.style.top = '0';
    this.textLayer.style.left = '0';
    this.textLayer.style.width = '100%';
    this.textLayer.style.height = '100%';
    this.textLayer.style.pointerEvents = 'auto';
    this.textLayer.style.zIndex = '1';
    this.renderContainer.appendChild(this.textLayer);

    // 创建矢量图形层（SVG）
    this.vectorLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.vectorLayer.setAttribute('class', b('vector-layer'));
    this.vectorLayer.style.position = 'absolute';
    this.vectorLayer.style.top = '0';
    this.vectorLayer.style.left = '0';
    this.vectorLayer.style.width = '100%';
    this.vectorLayer.style.height = '100%';
    this.vectorLayer.style.pointerEvents = 'none';
    this.vectorLayer.style.zIndex = '2';
    this.renderContainer.appendChild(this.vectorLayer);

    // 创建自由绘制层（Canvas）
    this.freehandLayer = document.createElement('canvas');
    this.freehandLayer.className = b('freehand-layer');
    this.freehandLayer.width = container.clientWidth;
    this.freehandLayer.height = container.clientHeight;
    this.freehandLayer.style.position = 'absolute';
    this.freehandLayer.style.top = '0';
    this.freehandLayer.style.left = '0';
    this.freehandLayer.style.width = '100%';
    this.freehandLayer.style.height = '100%';
    this.freehandLayer.style.pointerEvents = 'none';
    this.freehandLayer.style.zIndex = '3';
    this.renderContainer.appendChild(this.freehandLayer);
    this.freehandCtx = this.freehandLayer.getContext('2d');
  }

  renderNode(node: DocumentNode): void {
    if (!this.container) return;

    // 如果节点已存在，先移除
    this.removeNode(node.id);

    switch (node.type) {
      case 'text':
        this.renderTextNode(node);
        break;
      case 'vector':
        this.renderVectorNode(node);
        break;
      case 'freehand':
        this.renderFreehandNode(node);
        break;
    }
  }

  clear(): void {
    // 清除文本层
    if (this.textLayer) {
      this.textLayer.innerHTML = '';
    }

    // 清除矢量图形层
    if (this.vectorLayer) {
      while (this.vectorLayer.firstChild) {
        this.vectorLayer.removeChild(this.vectorLayer.firstChild);
      }
    }

    // 清除自由绘制层
    if (this.freehandCtx && this.freehandLayer) {
      this.freehandCtx.clearRect(0, 0, this.freehandLayer.width, this.freehandLayer.height);
    }

    this.nodeElements.clear();
  }

  destroy(): void {
    // 移除 Shadow DOM 宿主（会自动移除 Shadow DOM 及其所有内容）
    if (this.shadowRoot && this.shadowRoot.host && this.shadowRoot.host.parentNode) {
      this.shadowRoot.host.parentNode.removeChild(this.shadowRoot.host);
    }

    this.container = null;
    this.shadowRoot = null;
    this.renderContainer = null;
    this.textLayer = null;
    this.vectorLayer = null;
    this.freehandLayer = null;
    this.freehandCtx = null;
    this.nodeElements.clear();
  }

  /**
   * 注入样式到 Shadow DOM
   */
  private injectStyles(): void {
    if (!this.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = rendererStyles;
    this.shadowRoot.appendChild(style);
  }

  /**
   * 渲染富文本节点（DOM）
   */
  private renderTextNode(node: DocumentNode): void {
    if (!this.textLayer || !node.textData) return;

    const textElement = document.createElement('div');
    textElement.setAttribute('data-node-id', node.id);
    textElement.className = e('text-layer', 'node');
    textElement.contentEditable = 'true';
    textElement.style.position = 'absolute';
    textElement.style.left = `${node.x}px`;
    textElement.style.top = `${node.y}px`;
    textElement.style.width = `${node.width}px`;
    textElement.style.minHeight = `${node.height}px`;
    textElement.style.zIndex = node.zIndex?.toString() || '1';

    // 应用文本样式
    const textData = node.textData;
    if (textData.fontSize) {
      textElement.style.fontSize = `${textData.fontSize}px`;
    }
    if (textData.color) {
      textElement.style.color = textData.color;
    }
    if (textData.fontWeight) {
      textElement.style.fontWeight = textData.fontWeight.toString();
    }
    if (textData.fontStyle) {
      textElement.style.fontStyle = textData.fontStyle;
    }
    if (textData.textAlign) {
      textElement.style.textAlign = textData.textAlign;
    }

    // 设置内容
    textElement.innerHTML = textData.content || '';

    this.textLayer.appendChild(textElement);
    this.nodeElements.set(node.id, textElement);
  }

  /**
   * 渲染矢量图形节点（SVG）
   */
  private renderVectorNode(node: DocumentNode): void {
    if (!this.vectorLayer || !node.vectorData) return;

    const vectorData = node.vectorData;
    let svgElement: SVGElement | null = null;

    switch (vectorData.vectorType) {
      case 'rect':
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        svgElement.setAttribute('x', node.x.toString());
        svgElement.setAttribute('y', node.y.toString());
        svgElement.setAttribute('width', node.width.toString());
        svgElement.setAttribute('height', node.height.toString());
        break;

      case 'circle': {
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const radius = Math.min(node.width, node.height) / 2;
        svgElement.setAttribute('cx', (node.x + node.width / 2).toString());
        svgElement.setAttribute('cy', (node.y + node.height / 2).toString());
        svgElement.setAttribute('r', radius.toString());
        break;
      }

      case 'ellipse':
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        svgElement.setAttribute('cx', (node.x + node.width / 2).toString());
        svgElement.setAttribute('cy', (node.y + node.height / 2).toString());
        svgElement.setAttribute('rx', (node.width / 2).toString());
        svgElement.setAttribute('ry', (node.height / 2).toString());
        break;

      case 'line':
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        svgElement.setAttribute('x1', node.x.toString());
        svgElement.setAttribute('y1', node.y.toString());
        svgElement.setAttribute('x2', (node.x + node.width).toString());
        svgElement.setAttribute('y2', (node.y + node.height).toString());
        break;

      case 'path':
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (vectorData.pathData) {
          svgElement.setAttribute('d', vectorData.pathData);
        }
        svgElement.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        break;

      default:
        return;
    }

    if (!svgElement) return;

    svgElement.setAttribute('data-node-id', node.id);
    svgElement.setAttribute('class', e('vector-layer', 'node'));

    // 应用样式
    if (vectorData.fill) {
      svgElement.setAttribute('fill', vectorData.fill);
    } else {
      svgElement.setAttribute('fill', 'none');
    }

    if (vectorData.stroke) {
      svgElement.setAttribute('stroke', vectorData.stroke);
    }

    if (vectorData.strokeWidth !== undefined) {
      svgElement.setAttribute('stroke-width', vectorData.strokeWidth.toString());
    }

    // 应用其他属性
    if (vectorData.attributes) {
      Object.entries(vectorData.attributes).forEach(([key, value]) => {
        svgElement!.setAttribute(key, value.toString());
      });
    }

    // 设置 z-index（通过 SVG 的 order 或 group 实现）
    if (node.zIndex) {
      svgElement.style.zIndex = node.zIndex.toString();
    }

    this.vectorLayer.appendChild(svgElement);
    this.nodeElements.set(node.id, svgElement);
  }

  /**
   * 渲染自由绘制节点（Canvas）
   */
  private renderFreehandNode(node: DocumentNode): void {
    if (!this.freehandCtx || !this.freehandLayer || !node.freehandData) return;

    const freehandData = node.freehandData;
    const points = freehandData.points;

    if (points.length === 0) return;

    // 保存上下文状态
    this.freehandCtx.save();

    // 设置绘制样式
    this.freehandCtx.strokeStyle = freehandData.stroke || '#000000';
    this.freehandCtx.lineWidth = freehandData.strokeWidth || 2;
    this.freehandCtx.lineCap = freehandData.lineCap || 'round';
    this.freehandCtx.lineJoin = freehandData.lineJoin || 'round';

    // 开始绘制路径
    this.freehandCtx.beginPath();

    // 移动到第一个点
    const [firstX, firstY] = points[0];
    this.freehandCtx.moveTo(node.x + firstX, node.y + firstY);

    // 绘制路径
    if (points.length === 1) {
      // 单点，绘制一个小圆
      this.freehandCtx.arc(
        node.x + firstX,
        node.y + firstY,
        (freehandData.strokeWidth || 2) / 2,
        0,
        Math.PI * 2
      );
      this.freehandCtx.fill();
    } else {
      // 多点，绘制平滑曲线
      for (let i = 1; i < points.length; i++) {
        const [x, y, pressure] = points[i];
        const prevPoint = points[i - 1];
        const [prevX, prevY, prevPressure] = prevPoint;

        // 如果有压力信息，调整线宽
        if (pressure !== undefined && prevPressure !== undefined) {
          const avgPressure = (pressure + prevPressure) / 2;
          this.freehandCtx.lineWidth = (freehandData.strokeWidth || 2) * avgPressure;
        }

        // 使用二次贝塞尔曲线实现平滑
        if (i === 1) {
          // 第一个点，使用直线
          this.freehandCtx.lineTo(node.x + x, node.y + y);
        } else {
          // 使用控制点创建平滑曲线
          const [prevPrevX, prevPrevY] = points[i - 2];
          const cp1x = node.x + prevX + (prevX - prevPrevX) * 0.3;
          const cp1y = node.y + prevY + (prevY - prevPrevY) * 0.3;
          const cp2x = node.x + x - (x - prevX) * 0.3;
          const cp2y = node.y + y - (y - prevY) * 0.3;

          this.freehandCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, node.x + x, node.y + y);
        }
      }
      this.freehandCtx.stroke();
    }

    // 恢复上下文状态
    this.freehandCtx.restore();
  }

  /**
   * 移除节点
   */
  private removeNode(nodeId: string): void {
    const element = this.nodeElements.get(nodeId);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
      this.nodeElements.delete(nodeId);
    }
  }
}

/**
 * Canvas 渲染器（保留兼容性）
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

  renderNode(_node: DocumentNode): void {
    // TODO: 实现 Canvas 渲染（用于向后兼容）
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
}

/**
 * SVG 渲染器（保留兼容性）
 */
export class SVGRenderer implements Renderer {
  private svg: SVGElement | null = null;

  init(container: HTMLElement): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', container.clientWidth.toString());
    this.svg.setAttribute('height', container.clientHeight.toString());
    container.appendChild(this.svg);
  }

  renderNode(_node: DocumentNode): void {
    // TODO: 实现 SVG 渲染（用于向后兼容）
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
}

/**
 * 渲染器工厂
 */
export class RendererFactory {
  /**
   * 创建渲染器
   * @param type 渲染器类型：'hybrid' 使用混合渲染器（推荐），'canvas' 或 'svg' 用于向后兼容
   */
  static create(type: 'hybrid' | 'canvas' | 'svg' = 'hybrid'): Renderer {
    switch (type) {
      case 'hybrid':
        return new HybridRenderer();
      case 'canvas':
        return new CanvasRenderer();
      case 'svg':
        return new SVGRenderer();
      default:
        throw new Error(`Unknown renderer type: ${type}`);
    }
  }
}

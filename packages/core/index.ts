/**
 * core - 编辑器内核
 * 数据模型、命令系统、状态管理
 */

/**
 * 编辑器状态
 */
export interface EditorState {
  /** 当前选中的节点 ID */
  selectedNodeId: string | null;
  /** 文档内容 */
  content: DocumentNode[];
  /** 历史记录（用于撤销/重做） */
  history: HistoryEntry[];
  /** 当前历史记录索引 */
  historyIndex: number;
}

/**
 * 文档节点类型
 */
export type NodeType = 'text' | 'vector' | 'freehand';

/**
 * 矢量图形类型
 */
export type VectorType = 'rect' | 'circle' | 'ellipse' | 'line' | 'polygon' | 'path';

/**
 * 富文本节点数据
 */
export interface TextNodeData {
  /** 文本内容（HTML） */
  content: string;
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  color?: string;
  /** 字体粗细 */
  fontWeight?: string | number;
  /** 字体样式 */
  fontStyle?: string;
  /** 文本对齐方式 */
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * 矢量图形节点数据
 */
export interface VectorNodeData {
  /** 矢量图形类型 */
  vectorType: VectorType;
  /** SVG 路径数据（用于 path 类型） */
  pathData?: string;
  /** 填充颜色 */
  fill?: string;
  /** 描边颜色 */
  stroke?: string;
  /** 描边宽度 */
  strokeWidth?: number;
  /** 其他 SVG 属性 */
  attributes?: Record<string, string | number>;
}

/**
 * 自由绘制节点数据
 */
export interface FreehandNodeData {
  /** 绘制路径点数组 [x, y, pressure?] */
  points: Array<[number, number, number?]>;
  /** 描边颜色 */
  stroke?: string;
  /** 描边宽度 */
  strokeWidth?: number;
  /** 线条样式 */
  lineCap?: 'butt' | 'round' | 'square';
  /** 线条连接样式 */
  lineJoin?: 'miter' | 'round' | 'bevel';
}

/**
 * 文档节点基础接口
 */
export interface DocumentNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 富文本节点数据 */
  textData?: TextNodeData;
  /** 矢量图形节点数据 */
  vectorData?: VectorNodeData;
  /** 自由绘制节点数据 */
  freehandData?: FreehandNodeData;
  /** z-index 层级 */
  zIndex?: number;
}

/**
 * 历史记录条目
 */
export interface HistoryEntry {
  timestamp: number;
  state: EditorState;
}

/**
 * 命令接口
 */
export interface Command {
  execute(): void;
  undo(): void;
}

/**
 * 命令管理器
 */
export class CommandManager {
  private history: HistoryEntry[] = [];
  private historyIndex: number = -1;

  /**
   * 执行命令
   */
  execute(command: Command): void {
    command.execute();
    // TODO: 添加到历史记录
  }

  /**
   * 撤销
   */
  undo(): void {
    // TODO: 实现撤销逻辑
  }

  /**
   * 重做
   */
  redo(): void {
    // TODO: 实现重做逻辑
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }
}

/**
 * 状态管理器
 */
export class StateManager {
  private state: EditorState;
  private listeners: Set<(state: EditorState) => void> = new Set();

  constructor(initialState?: Partial<EditorState>) {
    this.state = {
      selectedNodeId: null,
      content: [],
      history: [],
      historyIndex: -1,
      ...initialState,
    };
  }

  /**
   * 获取当前状态
   */
  getState(): EditorState {
    return { ...this.state };
  }

  /**
   * 更新状态
   */
  setState(updates: Partial<EditorState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: EditorState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}

import { DeepPartial } from '../types/utils';

export const zhCN = {
  toolbar: {
    // 辅助工具
    drag: '拖动',
    select: '选择',
    zoom: '缩放',
    // 分类按钮
    text: '文本',
    shape: '图形',
    draw: '绘制',
    // 文本工具
    fontSize: '大小',
    fontColor: '颜色',
    bold: '粗体',
    italic: '斜体',
    underline: '下划线',
    strikethrough: '删除线',
    // 图形工具
    line: '直线',
    rectangle: '矩形',
    ellipse: '椭圆',
    polygon: '多边形',
    // 绘制工具
    pen: '画笔',
    penSize: '粗细',
    eraser: '橡皮',
  },
};

export type InternalLocale = typeof zhCN;
export type Locale = DeepPartial<InternalLocale>;

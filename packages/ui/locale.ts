import { DeepPartial } from '../types/utils';

export const zhCN = {
  toolbar: {
    bold: '粗体',
    italic: '斜体',
    underline: '下划线',
    strikethrough: '删除线',
    subscript: '下标',
    superscript: '上标',
  },
};

export type InternalLocale = typeof zhCN;
export type Locale = DeepPartial<InternalLocale>;

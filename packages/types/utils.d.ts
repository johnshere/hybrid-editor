/**
 * 深度可选工具类型
 * 将所有层级的属性都变为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

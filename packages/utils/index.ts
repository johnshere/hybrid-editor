import type { DeepPartial } from '../types/utils';

/**
 * 检测是否为移动设备
 * 通过 User Agent 字符串判断
 * @returns 如果是移动设备返回 true，否则返回 false
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;

  // 移动设备常见的 User Agent 模式
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(userAgent);
}

/**
 * 深度合并对象
 * 递归合并两个对象，将源对象的属性深度合并到目标对象中
 * @param target 目标对象（默认值）
 * @param source 源对象（用于合并，支持深度可选类型）
 * @returns 合并后的对象，类型为两个输入类型的交叉类型
 */
export function deepMerge<T extends Record<string, any>, U extends DeepPartial<T>>(
  target: T,
  source: U | undefined
): T & U {
  if (!source) {
    return target as T & U;
  }

  const result = { ...target } as T & U;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      // 如果两个值都是对象且不是数组，则递归合并
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        // 只有当源值不是 undefined 时才覆盖
        (result as any)[key] = sourceValue;
      }
    }
  }

  return result;
}

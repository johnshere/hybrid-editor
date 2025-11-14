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

  const userAgent =
    window.navigator.userAgent ||
    window.navigator.vendor ||
    (window as Window & { opera?: string }).opera ||
    '';

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
export function deepMerge<T extends Record<string, unknown>, U extends DeepPartial<T>>(
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
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as DeepPartial<Record<string, unknown>>
        ) as (T & U)[Extract<keyof U, string>];
      } else if (sourceValue !== undefined) {
        // 只有当源值不是 undefined 时才覆盖
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * BEM 命名空间前缀
 */
const BEM_PREFIX = 'he';

/**
 * 生成 BEM Block 类名
 * @param block Block 名称
 * @returns BEM Block 类名，格式：he-{block}
 * @example
 * b('container') // => 'he-container'
 * b('toolbar') // => 'he-toolbar'
 */
export function b(block: string): string {
  return `${BEM_PREFIX}-${block}`;
}

/**
 * 生成 BEM Element 类名
 * @param block Block 名称
 * @param element Element 名称
 * @returns BEM Element 类名，格式：he-{block}__{element}
 * @example
 * e('toolbar', 'button') // => 'he-toolbar__button'
 * e('property-panel', 'content') // => 'he-property-panel__content'
 */
export function e(block: string, element: string): string {
  return `${BEM_PREFIX}-${block}__${element}`;
}

/**
 * 生成 BEM Modifier 类名
 * @param block Block 名称
 * @param element Element 名称（可选，如果提供则生成 Element Modifier）
 * @param modifier Modifier 名称
 * @returns BEM Modifier 类名
 * @example
 * m('toolbar', 'fixed') // => 'he-toolbar--fixed'
 * m('toolbar', 'button', 'active') // => 'he-toolbar__button--active'
 */
export function m(block: string, elementOrModifier: string, modifier?: string): string {
  if (modifier !== undefined) {
    // Element Modifier: block__element--modifier
    return `${BEM_PREFIX}-${block}__${elementOrModifier}--${modifier}`;
  }
  // Block Modifier: block--modifier
  return `${BEM_PREFIX}-${block}--${elementOrModifier}`;
}

/**
 * 生成完整的 BEM 类名（组合函数）
 * @param block Block 名称
 * @param element Element 名称（可选）
 * @param modifier Modifier 名称（可选）
 * @returns 完整的 BEM 类名
 * @example
 * bem('container') // => 'he-container'
 * bem('toolbar', 'button') // => 'he-toolbar__button'
 * bem('toolbar', 'button', 'active') // => 'he-toolbar__button--active'
 * bem('toolbar', undefined, 'fixed') // => 'he-toolbar--fixed'
 */
export function bem(block: string, element?: string, modifier?: string): string {
  if (modifier !== undefined) {
    if (element !== undefined) {
      // Element Modifier
      return m(block, element, modifier);
    }
    // Block Modifier
    return m(block, modifier);
  }
  if (element !== undefined) {
    // Element
    return e(block, element);
  }
  // Block
  return b(block);
}

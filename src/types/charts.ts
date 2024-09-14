import type { StyleConfig } from "./cRender";
import type { AnimationCurve } from "./transition";

export interface ChartInstance {
  container: Node;
  canvas: HTMLCanvasElement;
  render?: any;
  option?: ChartOptions;
  resize: () => void;
  setOption: (option: ChartOptions, animationEnd?: boolean) => void;
}

export interface ChartOptions {
  title?: {
    /**
     * @description 是否显示标题
     * @default show = true
     */
    show?: boolean;
    /**
     * @description 标题文本
     * @default text = ''
     */
    text?: string;
    /**
     * @description 标题位置偏移
     * @default offset = [0, -20]
     */
    offset?: [number, number];
    /**
     * @description 标题默认样式
     * @default style = {Class Style的配置项}
     */
    style?: StyleConfig;
    /**
     * @description 标题渲染级别
     * 级别高者优先渲染
     * @default rLevel = 20
     */
    rLevel?: number;
    /**
     * @description 标题缓动曲线
     * @default animationCurve = 'easeOutCubic'
     */
    animationCurve?: AnimationCurve;
    /**
     * @description 标题缓动效果帧数
     * @default animationFrame = 50
     */
    animationFrame?: number;
  };
}

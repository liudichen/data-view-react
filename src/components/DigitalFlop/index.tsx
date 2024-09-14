import { useEffect, useRef, useMemo, type CSSProperties } from "react";
import { CRender } from "@jiaminghi/c-render";
import "@jiaminghi/charts/lib/extend/index";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import type { AnimationCurve, StyleConfig } from "@/types";

import "./style.css";

const defaultConfig: Required<Omit<DigitalFlopConfig, "formatter">> & Pick<DigitalFlopConfig, "formatter"> = {
  /**
   * @description Number for digital flop
   * @type {Array<Number>}
   * @default number = []
   * @example number = [10]
   */
  number: [],
  /**
   * @description Content formatter
   * @type {String}
   * @default content = ''
   * @example content = '{nt}个'
   */
  content: "",
  /**
   * @description Number toFixed
   * @type {Number}
   * @default toFixed = 0
   */
  toFixed: 0,
  /**
   * @description Text align
   * @type {String}
   * @default textAlign = 'center'
   * @example textAlign = 'center' | 'left' | 'right'
   */
  textAlign: "center",
  /**
   * @description rowGap
   * @type {Number}
   *@default rowGap = 0
   */
  rowGap: 0,
  /**
   * @description Text style configuration
   * @type {Object} {CRender Class Style}
   */
  style: {
    fontSize: 30,
    fill: "#3de7c9",
  },
  /**
   * @description Number formatter
   * @type {Null|Function}
   */
  formatter: undefined,
  /**
   * @description CRender animationCurve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: "easeOutCubic",
  /**
   * @description CRender animationFrame
   * @type {String}
   * @default animationFrame = 50
   */
  animationFrame: 50,
};

type DigitalFlopConfig = {
  /** Number for digital flop 数字数值
   * @description ``` 
   * number中的元素将被用于替换content内容模版中的{nt}标记，其替换顺序与模版标记的顺序一一对应：
   * const number = [1, 2, 3, 4]
    const content = '数字{nt},数字{nt},数字{nt},数字{nt}'
    // 实际显示效果：'数字1,数字2,数字3,数字4'
    ```
   * @default number = []
   * @example number = [10]
   */
  number?: number[];
  /** Content formatter 内容模版
   * @description ``` 
   * number中的元素将被用于替换content内容模版中的{nt}标记，其替换顺序与模版标记的顺序一一对应：
   * const number = [1, 2, 3, 4]
    const content = '数字{nt},数字{nt},数字{nt},数字{nt}'
    // 实际显示效果：'数字1,数字2,数字3,数字4'
    ```
   * @default content = ''
   * @example content = '{nt}个'
   */
  content?: string;
  /**
   * @description Number toFixed 小数位数
   * @default toFixed = 0
   */
  toFixed?: number;
  /**
   * @description Text align 水平对齐方式
   * @default textAlign = 'center'
   * @example textAlign = 'center' | 'left' | 'right'
   */
  textAlign?: "center" | "left" | "right";
  /**
   * @description rowGap 行间距 (当使用\n进行换行的时候，rowGap可以控制行间距)
   *@default rowGap = 0
   */
  rowGap?: number;
  /**
   * @description Text style configuration 样式配置
   * @default style = {fontSize: 30, fill: "#3de7c9"}
   */
  style?: StyleConfig;
  /**
   * @description Number formatter 格式化数字
   */
  formatter?: (value: number) => string;
  /**
   * @description CRender animationCurve 动效曲线
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve?: AnimationCurve;
  /**
   * @description CRender animationFrame 动效帧数(用于配置动画过程的帧数即动画时长)
   * @default animationFrame = 50
   */
  animationFrame?: number;
};

export interface DigitalFlopProps {
  className?: string;
  style?: CSSProperties;
  config?: DigitalFlopConfig;
}

/**
 * @description 数字翻牌器
 */
export const DigitalFlop = ({ config, className, style }: DigitalFlopProps) => {
  const domRef = useRef<HTMLCanvasElement>();
  const rendererRef = useRef<CRender>();
  const graphRef = useRef<any>(null);

  function getGraph(mergedConfig: typeof defaultConfig) {
    const { animationCurve, animationFrame } = mergedConfig;

    return rendererRef.current!.add({
      name: "numberText",
      animationCurve,
      animationFrame,
      shape: getShape(mergedConfig),
      style: getStyle(mergedConfig),
    } as any);
  }

  function getShape({ number, content, toFixed, textAlign, rowGap, formatter }: typeof defaultConfig) {
    const [w, h] = rendererRef.current!.area;

    const position = [w / 2, h / 2];

    if (textAlign === "left") position[0] = 0;
    if (textAlign === "right") position[0] = w;

    return { number, content, toFixed, position, rowGap, formatter };
  }

  function getStyle({ style, textAlign }: typeof defaultConfig) {
    return deepMerge(style, {
      textAlign,
      textBaseline: "middle",
    });
  }

  useEffect(() => {
    const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});

    if (!rendererRef.current) {
      rendererRef.current = new CRender(domRef.current!);

      graphRef.current = getGraph(mergedConfig);
    }

    const graph = graphRef.current;
    graph.animationEnd();

    const shape = getShape(mergedConfig);

    const cacheNum = graph.shape.number.length;
    const shapeNum = shape.number.length;

    cacheNum !== shapeNum && (graph.shape.number = shape.number);

    const { animationCurve, animationFrame } = mergedConfig;

    Object.assign(graph, { animationCurve, animationFrame });

    graph.animation("style", getStyle(mergedConfig), true);
    graph.animation("shape", shape);
  }, [config]);

  const classNames = useMemo(() => `dv-digital-flop${className ? ` ${className}` : ""}`, [className]);

  return (
    <div className={classNames} style={style}>
      <canvas ref={domRef as any} />
    </div>
  );
};

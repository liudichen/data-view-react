import { useRef, useState, useEffect, useMemo, type CSSProperties } from "react";
import Charts from "@jiaminghi/charts";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { co } from "@/utils";
import type { AnimationCurve, StyleConfig } from "@/types";

import { DigitalFlop } from "../DigitalFlop";

import "./style.css";

const defaultConfig: Required<ActiveRingChartConfig> = {
  radius: "50%",
  activeRadius: "55%",
  data: [{ name: "", value: 0 }],
  lineWidth: 20,
  activeTimeGap: 3000,
  color: [],
  digitalFlopStyle: {
    fontSize: 25,
    fill: "#fff",
  },
  digitalFlopToFixed: 0,
  digitalFlopUnit: "",
  animationCurve: "easeOutCubic",
  animationFrame: 50,
  showOriginValue: false,
};

type ActiveRingChartConfig = {
  /**
   * @description Ring radius 环半径
   * @default radius = '50%'
   * @example radius = '50%' | 100
   */
  radius?: number | string;
  /**
   * @description Active ring radius 环半径（动态）
   * @default activeRadius = '55%'
   * @example activeRadius = '55%' | 110
   */
  activeRadius?: number | string;
  /**
   * @description Ring data 环数据
   * @default data = [{ name: '', value: 0 }]
   */
  data?: { name: string; value: number }[];
  /**
   * @description Ring line width 环线条宽度
   * @default lineWidth = 20
   */
  lineWidth?: number;
  /**
   * @description Active time gap (ms) 切换间隔(ms)
   * @default activeTimeGap = 3000
   */
  activeTimeGap?: number;
  /**
   * @description Ring color 环颜色 (hex|rgb|rgba|color keywords)
   * @default color = [Charts Default Color]
   * @example color = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
   */
  color?: string[];
  /**
   * @description Digital flop style 数字翻牌器样式
   */
  digitalFlopStyle?: StyleConfig;
  /**
   * @description Digital flop toFixed 数字翻牌器小数位数
   * @default  digitalFlopToFixed = 0
   */
  digitalFlopToFixed?: number;
  /**
   * @description Digital flop unit 数字翻牌器数字单位
   */
  digitalFlopUnit?: string;
  /**
   * @description CRender animationCurve 动效曲线
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve?: AnimationCurve;
  /**
   * @description CRender animationFrame 动效帧数(配置动画过程的帧数即动画时长)
   * @default animationFrame = 50
   */
  animationFrame?: number;
  /**
   * @description showOriginValue 显示原始值?
   * @default showOriginValue = false
   */
  showOriginValue: false;
};

export interface ActiveRingChartProps {
  config?: ActiveRingChartConfig;
  className?: string;
  style?: CSSProperties;
}

/**
 * @description 动态环图
 */
export const ActiveRingChart = ({ config, className, style }: ActiveRingChartProps) => {
  const [{ activeIndex, mergedConfig }, setState] = useState<{
    activeIndex: number;
    mergedConfig: typeof defaultConfig;
  }>({
    activeIndex: 0,
    mergedConfig: null as unknown as typeof defaultConfig,
  });

  const domRef = useRef(null);
  const chartRef = useRef<any>(null);

  const digitalFlop = useMemo(() => {
    if (!mergedConfig) return {};

    const { digitalFlopStyle, digitalFlopToFixed, data, showOriginValue, digitalFlopUnit } = mergedConfig;

    const value = data.map(({ value }) => value);

    let displayValue;

    if (showOriginValue) {
      displayValue = value[activeIndex];
    } else {
      const sum = value.reduce((all, v) => all + v, 0);
      // @ts-ignore
      const percent = parseFloat((value[activeIndex] / sum) * 100) || 0;

      displayValue = percent;
    }

    return {
      content: showOriginValue ? `{nt}${digitalFlopUnit}` : `{nt}${digitalFlopUnit || "%"}`,
      number: [displayValue],
      style: digitalFlopStyle,
      toFixed: digitalFlopToFixed,
    };
  }, [mergedConfig, activeIndex]);

  const ringName = useMemo(
    () => (!mergedConfig ? "" : mergedConfig.data[activeIndex].name),
    [mergedConfig, activeIndex]
  );

  const fontSize = useMemo(
    () => (!mergedConfig ? {} : { fontSize: `${mergedConfig.digitalFlopStyle.fontSize}px` }),
    [mergedConfig]
  );

  function getRingOption(mergedConfig: typeof defaultConfig) {
    const radius = getRealRadius(mergedConfig);

    const newMergedConfig = {
      ...mergedConfig,
      data: mergedConfig.data.map((item) => ({ ...item, radius })),
    };

    return {
      series: [
        {
          type: "pie",
          ...newMergedConfig,
          outsideLabel: {
            show: false,
          },
        },
      ],
      color: newMergedConfig.color,
    };
  }

  function getRealRadius({ radius, activeRadius, lineWidth }: typeof defaultConfig, active = false) {
    const maxRadius = Math.min(...chartRef.current!.render.area) / 2;

    const halfLineWidth = lineWidth / 2;

    let realRadius = active ? activeRadius : radius;

    if (typeof realRadius !== "number") {
      realRadius = (parseInt(realRadius) / 100) * maxRadius;
    }

    const insideRadius = realRadius - halfLineWidth;
    const outSideRadius = realRadius + halfLineWidth;

    return [insideRadius, outSideRadius];
  }

  function getOption(mergedConfig: typeof defaultConfig, activeIndex: number) {
    const radius = getRealRadius(mergedConfig);
    const active = getRealRadius(mergedConfig, true);

    let option = getRingOption(mergedConfig);

    return {
      ...option,
      series: option.series.reduce(
        (prev: any[], serie, index) =>
          index !== 0
            ? [...prev, serie]
            : [
                ...prev,
                {
                  ...serie,
                  data: serie.data.map((item, i) => ({
                    ...item,
                    radius: i === activeIndex ? active : radius,
                  })),
                },
              ],
        []
      ),
    };
  }

  useEffect(() => {
    // 第一次时初始化
    chartRef.current || (chartRef.current = new Charts(domRef.current!));

    const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});

    chartRef.current.setOption(getRingOption(mergedConfig), true);

    let activeIndex = 0;

    function* loop() {
      while (true) {
        setState({ mergedConfig, activeIndex });

        const option = getOption(mergedConfig, activeIndex);

        chartRef.current.setOption(option, true);

        const { activeTimeGap, data } = option.series[0];

        yield new Promise((resolve) => setTimeout(resolve, activeTimeGap));

        activeIndex += 1;

        if (activeIndex >= data.length) {
          activeIndex = 0;
        }
      }
    }

    return co(loop).end;
  }, [config]);

  const classNames = useMemo(() => `dv-active-ring-chart ${className ? ` ${className}` : ""}`, [className]);

  return (
    <div className={classNames} style={style}>
      <div className="active-ring-chart-container" ref={domRef} />
      <div className="active-ring-info">
        <DigitalFlop config={digitalFlop} />
        <div className="active-ring-name" style={fontSize}>
          {ringName}
        </div>
      </div>
    </div>
  );
};

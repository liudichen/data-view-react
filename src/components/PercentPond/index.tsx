import { useEffect, useState, useRef, useMemo, type CSSProperties } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { uuid } from "@/utils";

import "./style.css";

const defaultConfig: Required<PercentPondConfig> = {
  value: 0,
  colors: ["#3DE7C9", "#00BAFF"],
  borderWidth: 3,
  borderGap: 3,
  lineDash: [5, 1],
  textColor: "#fff",
  borderRadius: 5,
  localGradient: false,
  formatter: "{value}%",
};

interface PercentPondConfig {
  /**
   * @description Value 进度池数值 0-100
   * @default value = 0
   */
  value?: number;
  /**
   * @description Colors (hex|rgb|rgba|color keywords) 进度池配色(自动应用渐变色，若不想使用渐变色，请配置两个相同的颜色)
   * @default colors = ['#00BAFF', '#3DE7C9']
   * @example colors = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
   */
  colors?: string[];
  /**
   * @description Border width 边框宽度
   * @default borderWidth = 3
   */
  borderWidth?: number;
  /**
   * @description Gap between border and pond 边框间隙
   * @default borderGap = 3
   */
  borderGap?: number;
  /**
   * @description Line dash 线条间隙\
   * @default lineDash = [5, 1]
   */
  lineDash?: [number, number];
  /**
   * @description Text color 文字颜色 (颜色支持hex|rgb|rgba|颜色关键字等四种类型)
   * @type {String}
   * @default textColor = '#fff'
   */
  textColor?: string;
  /**
   * @description Border radius 边框半径
   * @default borderRadius = 5
   */
  borderRadius?: number;
  /**
   * @description Local Gradient 局部渐变
   * @default localGradient = false
   * @example localGradient = false | true
   */
  localGradient?: boolean;
  /**
   * @description Formatter 信息格式化 (自动使用value的值替换字符串中的'{value}'标记)
   * @default formatter = '{value}%'
   */
  formatter?: string;
}

export interface PercentPondProps {
  className?: string;
  config?: PercentPondConfig;
  style?: CSSProperties;
}

/**
 * @description 进度池
 */
export const PercentPond = ({ config, className, style }: PercentPondProps) => {
  const domRef = useRef<HTMLDivElement>(null);

  const { gradientId1, gradientId2 } = useRef({
    gradientId1: `percent-pond-gradientId1-${uuid()}`,
    gradientId2: `percent-pond-gradientId2-${uuid()}`,
  }).current;

  const [{ width, height, mergedConfig }, setState] = useState({
    width: 0,
    height: 0,
    mergedConfig: null as unknown as typeof defaultConfig,
  });

  const rectWidth = useMemo(() => {
    if (!mergedConfig) return 0;

    const { borderWidth } = mergedConfig;

    return width - borderWidth;
  }, [mergedConfig, width]);

  const rectHeight = useMemo(() => {
    if (!mergedConfig) return 0;

    const { borderWidth } = mergedConfig;

    return height - borderWidth;
  }, [mergedConfig, height]);

  const points = useMemo(() => {
    const halfHeight = height / 2;

    if (!mergedConfig) return `0, ${halfHeight} 0, ${halfHeight}`;

    const { borderWidth, borderGap, value } = mergedConfig;

    const polylineLength = ((width - (borderWidth + borderGap) * 2) / 100) * value;

    return `
      ${borderWidth + borderGap}, ${halfHeight}
      ${borderWidth + borderGap + polylineLength}, ${halfHeight + 0.001}
    `;
  }, [mergedConfig, width, height]);

  const polylineWidth = useMemo(() => {
    if (!mergedConfig) return 0;

    const { borderWidth, borderGap } = mergedConfig;

    return height - (borderWidth + borderGap) * 2;
  }, [mergedConfig, height]);

  const linearGradient: [number, string][] = useMemo(() => {
    if (!mergedConfig) return [];

    const { colors } = mergedConfig;

    const colorNum = colors.length;

    const colorOffsetGap = 100 / (colorNum - 1);

    return colors.map((c, i) => [colorOffsetGap * i, c]);
  }, [mergedConfig]);

  const polylineGradient = useMemo(() => {
    if (!mergedConfig) return gradientId2;

    if (mergedConfig.localGradient) return gradientId1;

    return gradientId2;
  }, [gradientId1, gradientId2, mergedConfig]);

  const gradient2XPos = useMemo(() => {
    if (!mergedConfig) return "100%";

    const { value } = mergedConfig;

    return `${200 - value}%`;
  }, [mergedConfig]);

  const details = useMemo(() => {
    if (!mergedConfig) return "";

    const { value, formatter } = mergedConfig;

    return formatter.replace("{value}", value as any);
  }, [mergedConfig]);

  useEffect(() => {
    const { clientWidth: width, clientHeight: height } = domRef.current!;

    setState({
      width,
      height,
      mergedConfig: deepMerge(deepClone(defaultConfig, true), config || {}),
    });
  }, [config]);

  const classNames = useMemo(() => `dv-percent-pond${className ? ` ${className}` : ""}`, [className]);

  return (
    <div className={classNames} style={style} ref={domRef}>
      <svg>
        <defs>
          <linearGradient id={gradientId1} x1="0%" y1="0%" x2="100%" y2="0%">
            {linearGradient.map((lc) => (
              <stop key={lc[0]} offset={`${lc[0]}%`} stopColor={lc[1]} />
            ))}
          </linearGradient>

          <linearGradient id={gradientId2} x1="0%" y1="0%" x2={gradient2XPos} y2="0%">
            {linearGradient.map((lc) => (
              <stop key={lc[0]} offset={`${lc[0]}%`} stopColor={lc[1]} />
            ))}
          </linearGradient>
        </defs>
        <rect
          x={mergedConfig ? mergedConfig.borderWidth / 2 : "0"}
          y={mergedConfig ? mergedConfig.borderWidth / 2 : "0"}
          rx={mergedConfig ? mergedConfig.borderRadius : "0"}
          ry={mergedConfig ? mergedConfig.borderRadius : "0"}
          fill="transparent"
          strokeWidth={mergedConfig ? mergedConfig.borderWidth : "0"}
          stroke={`url(#${gradientId1})`}
          width={rectWidth > 0 ? rectWidth : 0}
          height={rectHeight > 0 ? rectHeight : 0}
        />
        <polyline
          strokeWidth={polylineWidth}
          strokeDasharray={mergedConfig ? mergedConfig.lineDash.join(",") : "0"}
          stroke={`url(#${polylineGradient})`}
          points={points}
        />
        <text
          stroke={mergedConfig ? mergedConfig.textColor : "#fff"}
          fill={mergedConfig ? mergedConfig.textColor : "#fff"}
          x={width / 2}
          y={height / 2}
        >
          {details}
        </text>
      </svg>
    </div>
  );
};

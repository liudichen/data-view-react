import { useMemo, forwardRef, type CSSProperties } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";

import "./style.css";

const defaultConfig: ConicalColumnChartConfig = {
  data: [],
  img: [],
  fontSize: 12,
  imgSideLength: 30,
  columnColor: "rgba(0, 194, 255, 0.4)",
  textColor: "#fff",
  showValue: false,
};

type ConicalColumnChartMergedConfig = Omit<Required<ConicalColumnChartConfig>, "data"> & {
  data: {
    name: string;
    value: number;
    percent: number;
  }[];
};
function getData(mergedConfig: ConicalColumnChartMergedConfig) {
  let { data } = mergedConfig;

  data = deepClone(data, true);

  data.sort(({ value: a }, { value: b }) => {
    if (a === b) return 0;
    if (a > b) return -1;
    return 1;
  });

  const max = data[0] ? data[0].value : 10;

  data = data.map((item) => ({
    ...item,
    percent: item.value / max,
  }));

  return data;
}

type ConicalColumnChartConfig = {
  /**
   * @description Chart data 柱数据
   * @default data = []
   */
  data?: { name: string; value: number }[];
  /**
   * @description Chart img 柱顶图片url
   * @default img = []
   */
  img?: string[];
  /**
   * @description Chart font size 文字大小
   * @default fontSize = 12
   */
  fontSize?: number;
  /**
   * @description Img side length 图片边长
   * @type {Number}
   * @default imgSideLength = 30
   */
  imgSideLength?: number;
  /**
   * @description Column color 柱颜色(将根据自动排序后的排名顺序使用img中的图片)
   * @default columnColor = 'rgba(0, 194, 255, 0.4)'
   */
  columnColor?: string;
  /**
   * @description Text color 文字颜色
   * @default textColor = '#fff'
   */
  textColor?: string;
  /**
   * @description Show value 显示数值?
   * @default showValue = false
   */
  showValue?: boolean;
};

export interface ConicalColumnChartProps {
  className?: string;
  style?: CSSProperties;
  config?: ConicalColumnChartConfig;
}

/**
 * 锥形柱图
 * @description 锥形柱图是特殊的柱状图，他将根据数值大小，降序排列锥形柱，适合排名类数据展示
 */
export const ConicalColumnChart = forwardRef<AutoResizeActions, ConicalColumnChartProps>(
  ({ config, className, style }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const { mergedConfig, column } = useMemo(() => {
      const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});

      mergedConfig.data = getData(mergedConfig as any);

      function getColumn(mergedConfig: ConicalColumnChartMergedConfig) {
        const { imgSideLength, fontSize, data } = mergedConfig;

        const itemNum = data.length;
        const gap = width / (itemNum + 1);

        const useAbleHeight = height - imgSideLength - fontSize - 5;
        const svgBottom = height - fontSize - 5;

        return data.map((item, i) => {
          const { percent } = item;

          const middleXPos = gap * (i + 1);
          const leftXPos = gap * i;
          const rightXpos = gap * (i + 2);

          const middleYPos = svgBottom - useAbleHeight * percent;
          const controlYPos = useAbleHeight * percent * 0.6 + middleYPos;

          const d = `
        M${leftXPos}, ${svgBottom}
        Q${middleXPos}, ${controlYPos} ${middleXPos},${middleYPos}
        M${middleXPos},${middleYPos}
        Q${middleXPos}, ${controlYPos} ${rightXpos},${svgBottom}
        L${leftXPos}, ${svgBottom}
        Z
      `;

          const textY = (svgBottom + middleYPos) / 2 + fontSize / 2;

          return {
            ...item,
            d,
            x: middleXPos,
            y: middleYPos,
            textY,
          };
        });
      }

      return { mergedConfig, column: getColumn(mergedConfig as ConicalColumnChartMergedConfig) };
    }, [config, width, height]);

    const classNames = useMemo(() => `dv-conical-column-chart${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg width={width} height={height}>
          {column.map((item, i) => (
            <g key={i}>
              <path d={item.d} fill={mergedConfig.columnColor} />
              <text
                style={{ fontSize: `${mergedConfig.fontSize}px` }}
                fill={mergedConfig.textColor}
                x={item.x}
                y={height - 4}
              >
                {item.name}
              </text>
              {!!mergedConfig.img.length && (
                <image
                  href={mergedConfig.img[i % mergedConfig.img.length]}
                  width={mergedConfig.imgSideLength}
                  height={mergedConfig.imgSideLength}
                  x={item.x - mergedConfig.imgSideLength / 2}
                  y={item.y - mergedConfig.imgSideLength}
                />
              )}
              {mergedConfig.showValue && (
                <text
                  style={{ fontSize: `${mergedConfig.fontSize}px` }}
                  fill={mergedConfig.textColor}
                  x={item.x}
                  y={item.textY}
                >
                  {item.value}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  }
);

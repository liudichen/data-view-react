import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import "./style.css";

const defaultConfig: Required<CapsuleChartConfig> = {
  /**
   * @description Capsule chart data
   * @type {Array<Object>}
   * @default data = []
   * @example data = [{ name: 'foo1', value: 100 }, { name: 'foo2', value: 100 }]
   */
  data: [],
  /**
   * @description Colors (hex|rgb|rgba|color keywords)
   * @type {Array<String>}
   * @default color = ['#37a2da', '#32c5e9', '#67e0e3', '#9fe6b8', '#ffdb5c', '#ff9f7f', '#fb7293']
   * @example color = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
   */
  colors: ["#37a2da", "#32c5e9", "#67e0e3", "#9fe6b8", "#ffdb5c", "#ff9f7f", "#fb7293"],
  /**
   * @description Chart unit
   * @type {String}
   * @default unit = ''
   */
  unit: "",
  /**
   * @description Show item value
   * @type {Boolean}
   * @default showValue = false
   */
  showValue: false,
};

type CapsuleChartConfig = {
  /**
   * @description Capsule chart data 柱数据
   * @default data = []
   * @example data = [{ name: 'foo1', value: 100 }, { name: 'foo2', value: 100 }]
   */
  data?: { name: string; value: number }[];
  /**
   * @description Colors 颜色 (hex|rgb|rgba|color keywords)
   * @default color = ['#37a2da', '#32c5e9', '#67e0e3', '#9fe6b8', '#ffdb5c', '#ff9f7f', '#fb7293']
   * @example color = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
   */
  colors?: string[];
  /**
   * @description Chart unit 单位
   * @default unit = ''
   */
  unit?: string;
  /**
   * @description Show item value 显示数值?
   * @default showValue = false
   */
  showValue?: boolean;
};

export interface CapsuleChartProps {
  className?: string;
  config?: CapsuleChartConfig;
  style?: CSSProperties;
}

/**
 * @description 胶囊柱图
 */
export const CapsuleChart = ({ config, className, style }: CapsuleChartProps) => {
  const [{ mergedConfig, labelData, capsuleLength, capsuleValue }, setState] = useState({
    mergedConfig: null as unknown as typeof defaultConfig,
    labelData: [] as number[],
    capsuleLength: [] as number[],
    capsuleValue: [] as number[],
  });

  useEffect(() => {
    const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});

    const { data } = mergedConfig;

    if (!data.length) return;

    const capsuleValue = data.map(({ value }) => value);

    const maxValue = Math.max(...capsuleValue);

    const oneFifth = maxValue / 5;

    setState({
      mergedConfig,
      capsuleValue,
      capsuleLength: capsuleValue.map((v) => (maxValue ? v / maxValue : 0)),
      // @ts-ignore
      labelData: [...new Set(new Array(6).fill(0).map((v, i) => Math.ceil(i * oneFifth)))],
    });
  }, [config]);

  const classNames = useMemo(() => `dv-capsule-chart ${className ? ` ${className}` : ""}`, [className]);

  return (
    <div className={classNames} style={style}>
      {!!mergedConfig && (
        <>
          <div className="label-column">
            {mergedConfig.data.map(({ name }) => (
              <div key={name}>{name}</div>
            ))}
            <div>&nbsp;</div>
          </div>

          <div className="capsule-container">
            {capsuleLength.map((capsule, index) => (
              <div className="capsule-item" key={index}>
                <div
                  className="capsule-item-column"
                  style={{
                    width: `${capsule * 100}%`,
                    backgroundColor: `${mergedConfig.colors[index % mergedConfig.colors.length]}`,
                  }}
                >
                  {mergedConfig.showValue && <div className="capsule-item-value">{capsuleValue[index]}</div>}
                </div>
              </div>
            ))}

            <div className="unit-label">
              {labelData.map((label, index) => (
                <div key={label + index}>{label}</div>
              ))}
            </div>
          </div>

          {!!mergedConfig.unit && <div className="unit-text">{mergedConfig.unit}</div>}
        </>
      )}
    </div>
  );
};

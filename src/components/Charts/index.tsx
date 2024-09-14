import { useRef, useEffect, useMemo, forwardRef, CSSProperties, MutableRefObject } from "react";
import Chart from "@jiaminghi/charts";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { ChartInstance, ChartOptions } from "@/types";

import "./style.css";

export interface ChartsProps {
  option?: ChartOptions;
  className?: string;
  style?: CSSProperties;
}
/**
 * @description 图表组件 基于Charts封装，只需要将对应图表option数据传入组件即可 */
export const Charts = forwardRef<AutoResizeActions, ChartsProps>(({ option = {}, className, style }, ref) => {
  const { width, height, domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

  const chartRef = useRef<HTMLDivElement>();

  const chartInstanceofRef = useRef(null) as unknown as MutableRefObject<ChartInstance>;

  useEffect(() => {
    chartInstanceofRef.current || (chartInstanceofRef.current = new Chart(chartRef.current));

    chartInstanceofRef.current.setOption(option || {}, true);
  }, [option]);

  useEffect(() => {
    chartInstanceofRef.current.resize();
  }, [width, height]);

  const classNames = useMemo(
    () => (className ? `dv-charts-container ${className}` : "dv-charts-container"),
    [className]
  );

  return (
    <div className={classNames} style={style} ref={domRef}>
      <div className="charts-canvas-container" ref={chartRef as any} />
    </div>
  );
});

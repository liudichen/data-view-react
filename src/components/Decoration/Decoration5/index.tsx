import { useMemo, forwardRef } from "react";
import { deepMerge, getPolylineLength } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#3f96a5", "#3f96a5"];

export interface Decoration5Props extends DecorationCommonProps {
  /**
   * @default dur = 1.2
   */
  dur?: number;
}

export const Decoration5 = forwardRef<AutoResizeActions, Decoration5Props>(
  ({ className, style, color, dur = 1.2 }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-decoration-5${className ? ` ${className}` : ""}`, [className]);

    const { line1PointsString, line2PointsString, line1Length, line2Length } = useMemo(() => {
      let line1Points: [number, number][] = [
        [0, height * 0.2],
        [width * 0.18, height * 0.2],
        [width * 0.2, height * 0.4],
        [width * 0.25, height * 0.4],
        [width * 0.27, height * 0.6],
        [width * 0.72, height * 0.6],
        [width * 0.75, height * 0.4],
        [width * 0.8, height * 0.4],
        [width * 0.82, height * 0.2],
        [width, height * 0.2],
      ];

      let line2Points: [number, number][] = [
        [width * 0.3, height * 0.8],
        [width * 0.7, height * 0.8],
      ];

      const line1Length = getPolylineLength(line1Points);
      const line2Length = getPolylineLength(line2Points);

      const line1PointsString = line1Points.map((point) => point.join(",")).join(" ");
      const line2PointsString = line2Points.map((point) => point.join(",")).join(" ");

      return { line1PointsString, line2PointsString, line1Length, line2Length };
    }, [width, height]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg width={width} height={height}>
          <polyline fill="transparent" stroke={mergedColor[0]} strokeWidth="3" points={line1PointsString}>
            <animate
              attributeName="stroke-dasharray"
              attributeType="XML"
              from={`0, ${line1Length / 2}, 0, ${line1Length / 2}`}
              to={`0, 0, ${line1Length}, 0`}
              dur={`${dur}s`}
              begin="0s"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.4,1,0.49,0.98"
              repeatCount="indefinite"
            />
          </polyline>
          <polyline fill="transparent" stroke={mergedColor[1]} strokeWidth="2" points={line2PointsString}>
            <animate
              attributeName="stroke-dasharray"
              attributeType="XML"
              from={`0, ${line2Length / 2}, 0, ${line2Length / 2}`}
              to={`0, 0, ${line2Length}, 0`}
              dur={`${dur}s`}
              begin="0s"
              calcMode="spline"
              keyTimes="0;1"
              keySplines=".4,1,.49,.98"
              repeatCount="indefinite"
            />
          </polyline>
        </svg>
      </div>
    );
  }
);

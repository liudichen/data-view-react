import { useMemo, forwardRef } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#3f96a5", "#3f96a5"];

export interface Decoration8Props extends DecorationCommonProps {
  /**
   * @default reverse = false
   */
  reverse?: boolean;
}

export const Decoration8 = forwardRef<AutoResizeActions, Decoration8Props>(
  ({ className, style, color, reverse = false }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-decoration-8${className ? ` ${className}` : ""}`, [className]);

    const [pointsOne, pointsTwo, pointsThree] = useMemo(() => {
      const xPos = (pos: number) => (!reverse ? pos : width - pos);
      return [
        `${xPos(0)}, 0 ${xPos(30)}, ${height / 2}`,
        `${xPos(20)}, 0 ${xPos(50)}, ${height / 2} ${xPos(width)}, ${height / 2}`,
        `${xPos(0)}, ${height - 3}, ${xPos(200)}, ${height - 3}`,
      ];
    }, [reverse, width, height]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg width={width} height={height}>
          <polyline stroke={mergedColor[0]} strokeWidth="2" fill="transparent" points={pointsOne} />

          <polyline stroke={mergedColor[0]} strokeWidth="2" fill="transparent" points={pointsTwo} />

          <polyline stroke={mergedColor[1]} fill="transparent" strokeWidth="3" points={pointsThree} />
        </svg>
      </div>
    );
  }
);

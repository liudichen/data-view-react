import { useMemo, forwardRef } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#3faacb", "#fff"];

export interface Decoration2Props extends DecorationCommonProps {
  /**
   * @default dur = 6
   */
  dur?: number;
  /**
   * @default reverse = false
   */
  reverse?: boolean;
}

export const Decoration2 = forwardRef<AutoResizeActions, Decoration2Props>(
  ({ className, style, color, dur = 6, reverse = false }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    function calcSVGData() {
      return reverse ? { w: 1, h: height, x: width / 2, y: 0 } : { w: width, h: 1, x: 0, y: height / 2 };
    }

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const { x, y, w, h } = useMemo(calcSVGData, [reverse, width, height]);

    const classNames = useMemo(() => `dv-decoration-2${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg width={`${width}px`} height={`${height}px`}>
          <rect x={x} y={y} width={w} height={h} fill={mergedColor[0]}>
            <animate
              attributeName={reverse ? "height" : "width"}
              from="0"
              to={reverse ? height : width}
              dur={`${dur}s`}
              calcMode="spline"
              keyTimes="0;1"
              keySplines=".42,0,.58,1"
              repeatCount="indefinite"
            />
          </rect>

          <rect x={x} y={y} width="1" height="1" fill={mergedColor[1]}>
            <animate
              attributeName={reverse ? "y" : "x"}
              from="0"
              to={reverse ? height : width}
              dur={`${dur}s`}
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.42,0,0.58,1"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      </div>
    );
  }
);

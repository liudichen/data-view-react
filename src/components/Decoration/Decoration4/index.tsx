import { useMemo, forwardRef } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.3)"];

export interface Decoration4Props extends DecorationCommonProps {
  /**
   * @default reverse = false
   */
  reverse?: boolean;
  /**
   * @default dur = 3
   */
  dur?: number;
}

export const Decoration4 = forwardRef<AutoResizeActions, Decoration4Props>(
  ({ className, style, color, dur = 3, reverse = false }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-decoration-4${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <div
          className={`container ${reverse ? "reverse" : "normal"}`}
          style={
            reverse
              ? { width: `${width}px`, height: `5px`, animationDuration: `${dur}s` }
              : { width: `5px`, height: `${height}px`, animationDuration: `${dur}s` }
          }
        >
          <svg width={reverse ? width : 5} height={reverse ? 5 : height}>
            <polyline stroke={mergedColor[0]} points={reverse ? `0, 2.5 ${width}, 2.5` : `2.5, 0 2.5, ${height}`} />
            <polyline
              className="bold-line"
              stroke={mergedColor[1]}
              strokeWidth="3"
              strokeDasharray="20, 80"
              strokeDashoffset="-30"
              points={reverse ? `0, 2.5 ${width}, 2.5` : `2.5, 0 2.5, ${height}`}
            />
          </svg>
        </div>
      </div>
    );
  }
);

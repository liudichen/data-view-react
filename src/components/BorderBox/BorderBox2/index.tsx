import { useMemo, forwardRef, type MutableRefObject } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { BorderBoxCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#fff", "rgba(255, 255, 255, 0.6)"];

export interface BorderBox2Props extends BorderBoxCommonProps {}

export const BorderBox2 = forwardRef<AutoResizeActions, BorderBox2Props>(
  ({ children, className, style, color, backgroundColor = "transparent" }, ref) => {
    const { width, height, domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-border-box-2${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg className="dv-border-svg-container" width={width} height={height}>
          <polygon
            fill={backgroundColor}
            points={`
          7, 7 ${width - 7}, 7 ${width - 7}, ${height - 7} 7, ${height - 7}
        `}
          />
          <polyline
            stroke={mergedColor[0]}
            points={`2, 2 ${width - 2} ,2 ${width - 2}, ${height - 2} 2, ${height - 2} 2, 2`}
          />
          <polyline
            stroke={mergedColor[1]}
            points={`6, 6 ${width - 6}, 6 ${width - 6}, ${height - 6} 6, ${height - 6} 6, 6`}
          />
          <circle fill={mergedColor[0]} cx="11" cy="11" r="1" />
          <circle fill={mergedColor[0]} cx={width - 11} cy="11" r="1" />
          <circle fill={mergedColor[0]} cx={width - 11} cy={height - 11} r="1" />
          <circle fill={mergedColor[0]} cx="11" cy={height - 11} r="1" />
        </svg>
        <div className="border-box-content">{children}</div>
      </div>
    );
  }
);

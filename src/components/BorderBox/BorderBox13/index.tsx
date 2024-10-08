import { useMemo, forwardRef, type MutableRefObject } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { BorderBoxCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#6586ec", "#2cf7fe"];

export interface BorderBox13Props extends BorderBoxCommonProps {}

export const BorderBox13 = forwardRef<AutoResizeActions, BorderBox13Props>(
  ({ children, className, style, color, backgroundColor = "transparent" }, ref) => {
    const { width, height, domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => (className ? `dv-border-box-13 ${className}` : "dv-border-box-13"), [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg className="dv-border-svg-container" width={width} height={height}>
          <path
            fill={backgroundColor}
            stroke={mergedColor[0]}
            d={`
            M 5 20 L 5 10 L 12 3  L 60 3 L 68 10
            L ${width - 20} 10 L ${width - 5} 25
            L ${width - 5} ${height - 5} L 20 ${height - 5}
            L 5 ${height - 20} L 5 20
          `}
          />

          <path
            fill="transparent"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="10, 5"
            stroke={mergedColor[0]}
            d="M 16 9 L 61 9"
          />

          <path fill="transparent" stroke={mergedColor[1]} d="M 5 20 L 5 10 L 12 3  L 60 3 L 68 10" />

          <path
            fill="transparent"
            stroke={mergedColor[1]}
            d={`M ${width - 5} ${height - 30} L ${width - 5} ${height - 5} L ${width - 30} ${height - 5}`}
          />
        </svg>
        <div className="border-box-content">{children}</div>
      </div>
    );
  }
);

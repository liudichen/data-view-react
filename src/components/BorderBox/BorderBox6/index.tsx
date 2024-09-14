import { useMemo, forwardRef, type MutableRefObject } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { BorderBoxCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["rgba(255, 255, 255, 0.35)", "gray"];

export interface BorderBox6Props extends BorderBoxCommonProps {}

export const BorderBox6 = forwardRef<AutoResizeActions, BorderBox6Props>(
  ({ children, className, style, color, backgroundColor = "transparent" }, ref) => {
    const { width, height, domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-border-box-6${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg className="dv-border-svg-container" width={width} height={height}>
          <polygon
            fill={backgroundColor}
            points={`
          9, 7 ${width - 9}, 7 ${width - 9}, ${height - 7} 9, ${height - 7}
        `}
          />
          <circle fill={mergedColor[1]} cx="5" cy="5" r="2" />
          <circle fill={mergedColor[1]} cx={width - 5} cy="5" r="2" />
          <circle fill={mergedColor[1]} cx={width - 5} cy={height - 5} r="2" />
          <circle fill={mergedColor[1]} cx="5" cy={height - 5} r="2" />
          <polyline stroke={mergedColor[0]} points={`10, 4 ${width - 10}, 4`} />
          <polyline stroke={mergedColor[0]} points={`10, ${height - 4} ${width - 10}, ${height - 4}`} />
          <polyline stroke={mergedColor[0]} points={`5, 70 5, ${height - 70}`} />
          <polyline stroke={mergedColor[0]} points={`${width - 5}, 70 ${width - 5}, ${height - 70}`} />
          <polyline stroke={mergedColor[0]} points={`3, 10, 3, 50`} />
          <polyline stroke={mergedColor[0]} points={`7, 30 7, 80`} />
          <polyline stroke={mergedColor[0]} points={`${width - 3}, 10 ${width - 3}, 50`} />
          <polyline stroke={mergedColor[0]} points={`${width - 7}, 30 ${width - 7}, 80`} />
          <polyline stroke={mergedColor[0]} points={`3, ${height - 10} 3, ${height - 50}`} />
          <polyline stroke={mergedColor[0]} points={`7, ${height - 30} 7, ${height - 80}`} />
          <polyline stroke={mergedColor[0]} points={`${width - 3}, ${height - 10} ${width - 3}, ${height - 50}`} />
          <polyline stroke={mergedColor[0]} points={`${width - 7}, ${height - 30} ${width - 7}, ${height - 80}`} />
        </svg>

        <div className="border-box-content">{children}</div>
      </div>
    );
  }
);

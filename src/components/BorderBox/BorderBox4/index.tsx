import { useMemo, forwardRef, type MutableRefObject } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { BorderBoxCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["red", "rgba(0,0,255,0.8)"];

export interface BorderBox4Props extends BorderBoxCommonProps {
  reverse?: boolean;
}

export const BorderBox4 = forwardRef<AutoResizeActions, BorderBox4Props>(
  ({ children, className, style, color, backgroundColor = "transparent", reverse = false }, ref) => {
    const { width, height, domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-border-box-4${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg className={`dv-border-svg-container ${reverse && "dv-reverse"}`} width={width} height={height}>
          <polygon
            fill={backgroundColor}
            points={`
          ${width - 15}, 22 170, 22 150, 7 40, 7 28, 21 32, 24
          16, 42 16, ${height - 32} 41, ${height - 7} ${width - 15}, ${height - 7}
        `}
          />
          <polyline
            className="dv-bb4-line-1"
            stroke={mergedColor[0]}
            points={`145, ${height - 5} 40, ${height - 5} 10, ${height - 35}
          10, 40 40, 5 150, 5 170, 20 ${width - 15}, 20`}
          />
          <polyline
            className="dv-bb4-line-2"
            stroke={mergedColor[1]}
            points={`245, ${height - 1} 36, ${height - 1} 14, ${height - 23}
          14, ${height - 100}`}
          />
          <polyline className="dv-bb4-line-3" stroke={mergedColor[0]} points={`7, ${height - 40} 7, ${height - 75}`} />
          <polyline className="dv-bb4-line-4" stroke={mergedColor[0]} points={`28, 24 13, 41 13, 64`} />
          <polyline className="dv-bb4-line-5" stroke={mergedColor[0]} points={`5, 45 5, 140`} />
          <polyline className="dv-bb4-line-6" stroke={mergedColor[1]} points={`14, 75 14, 180`} />
          <polyline className="dv-bb4-line-7" stroke={mergedColor[1]} points={`55, 11 147, 11 167, 26 250, 26`} />
          <polyline className="dv-bb4-line-8" stroke={mergedColor[1]} points={`158, 5 173, 16`} />
          <polyline className="dv-bb4-line-9" stroke={mergedColor[0]} points={`200, 17 ${width - 10}, 17`} />
          <polyline className="dv-bb4-line-10" stroke={mergedColor[1]} points={`385, 17 ${width - 10}, 17`} />
        </svg>

        <div className="border-box-content">{children}</div>
      </div>
    );
  }
);

import { useMemo, forwardRef, type MutableRefObject } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { BorderBoxCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["rgba(128,128,128,0.3)", "rgba(128,128,128,0.5)"];

export interface BorderBox7Props extends BorderBoxCommonProps {}

export const BorderBox7 = forwardRef<AutoResizeActions, BorderBox7Props>(
  ({ children, className, style, color, backgroundColor = "transparent" }, ref) => {
    const { width, height, domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-border-box-7${className ? ` ${className}` : ""}`, [className]);

    const styles = useMemo(
      () => ({
        boxShadow: `inset 0 0 40px ${mergedColor[0]}`,
        border: `1px solid ${mergedColor[0]}`,
        backgroundColor,
        ...(style || {}),
      }),
      [style, mergedColor, backgroundColor]
    );

    return (
      <div className={classNames} style={styles} ref={domRef}>
        <svg className="dv-border-svg-container" width={width} height={height}>
          <polyline className="dv-bb7-line-width-2" stroke={mergedColor[0]} points={`0, 25 0, 0 25, 0`} />
          <polyline
            className="dv-bb7-line-width-2"
            stroke={mergedColor[0]}
            points={`${width - 25}, 0 ${width}, 0 ${width}, 25`}
          />
          <polyline
            className="dv-bb7-line-width-2"
            stroke={mergedColor[0]}
            points={`${width - 25}, ${height} ${width}, ${height} ${width}, ${height - 25}`}
          />
          <polyline
            className="dv-bb7-line-width-2"
            stroke={mergedColor[0]}
            points={`0, ${height - 25} 0, ${height} 25, ${height}`}
          />
          <polyline className="dv-bb7-line-width-5" stroke={mergedColor[1]} points={`0, 10 0, 0 10, 0`} />
          <polyline
            className="dv-bb7-line-width-5"
            stroke={mergedColor[1]}
            points={`${width - 10}, 0 ${width}, 0 ${width}, 10`}
          />
          <polyline
            className="dv-bb7-line-width-5"
            stroke={mergedColor[1]}
            points={`${width - 10}, ${height} ${width}, ${height} ${width}, ${height - 10}`}
          />
          <polyline
            className="dv-bb7-line-width-5"
            stroke={mergedColor[1]}
            points={`0, ${height - 10} 0, ${height} 10, ${height}`}
          />
        </svg>

        <div className="border-box-content">{children}</div>
      </div>
    );
  }
);

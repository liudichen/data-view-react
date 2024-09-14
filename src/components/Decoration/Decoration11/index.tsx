import { useMemo, forwardRef, type ReactNode } from "react";
import { fade } from "@jiaminghi/color";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#1a98fc", "#2cf7fe"];

export interface Decoration11Props extends DecorationCommonProps {
  children?: ReactNode;
}

export const Decoration11 = forwardRef<AutoResizeActions, Decoration11Props>(
  ({ className, style, color, children }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => `dv-decoration-11${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg width={width} height={height}>
          <polygon
            fill={fade(mergedColor[1] || defaultColor[1], 10)}
            stroke={mergedColor[1]}
            points={`20 10, 25 4, 55 4 60 10`}
          />

          <polygon
            fill={fade(mergedColor[1] || defaultColor[1], 10)}
            stroke={mergedColor[1]}
            points={`20 ${height - 10}, 25 ${height - 4}, 55 ${height - 4} 60 ${height - 10}`}
          />

          <polygon
            fill={fade(mergedColor[1] || defaultColor[1], 10)}
            stroke={mergedColor[1]}
            points={`${width - 20} 10, ${width - 25} 4, ${width - 55} 4 ${width - 60} 10`}
          />

          <polygon
            fill={fade(mergedColor[1] || defaultColor[1], 10)}
            stroke={mergedColor[1]}
            points={`${width - 20} ${height - 10}, ${width - 25} ${height - 4}, ${width - 55} ${height - 4} ${
              width - 60
            } ${height - 10}`}
          />

          <polygon
            fill={fade(mergedColor[0] || defaultColor[0], 20)}
            stroke={mergedColor[0]}
            points={`
            20 10, 5 ${height / 2} 20 ${height - 10}
            ${width - 20} ${height - 10} ${width - 5} ${height / 2} ${width - 20} 10
          `}
          />

          <polyline
            fill="transparent"
            stroke={fade(mergedColor[0] || defaultColor[0], 70)}
            points={`25 18, 15 ${height / 2} 25 ${height - 18}`}
          />

          <polyline
            fill="transparent"
            stroke={fade(mergedColor[0] || defaultColor[0], 70)}
            points={`${width - 25} 18, ${width - 15} ${height / 2} ${width - 25} ${height - 18}`}
          />
        </svg>

        <div className="decoration-content">{children}</div>
      </div>
    );
  }
);

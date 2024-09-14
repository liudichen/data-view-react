import { useMemo, type ReactNode } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#1dc1f5", "#1dc1f5"];

export interface Decoration7Props extends DecorationCommonProps {
  children?: ReactNode;
}

export const Decoration7 = ({ className, style, color, children }: Decoration7Props) => {
  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

  const classNames = useMemo(() => `dv-decoration-7${className ? ` ${className}` : ""}`, [className]);

  return (
    <div className={classNames} style={style}>
      <svg width="21px" height="20px">
        <polyline strokeWidth="4" fill="transparent" stroke={mergedColor[0]} points="10, 0 19, 10 10, 20" />
        <polyline strokeWidth="2" fill="transparent" stroke={mergedColor[1]} points="2, 0 11, 10 2, 20" />
      </svg>
      {children}
      <svg width="21px" height="20px">
        <polyline strokeWidth="4" fill="transparent" stroke={mergedColor[0]} points="11, 0 2, 10 11, 20" />
        <polyline strokeWidth="2" fill="transparent" stroke={mergedColor[1]} points="19, 0 10, 10 19, 20" />
      </svg>
    </div>
  );
};

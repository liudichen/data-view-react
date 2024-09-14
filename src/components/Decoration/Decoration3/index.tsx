import { useMemo, forwardRef } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import { getDecorationPoints } from "@/utils";
import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#7acaec", "transparent"];

const pointSideLength = 7;

const svgWH: [number, number] = [300, 35];

const rowNum = 2;

const rowPoints = 25;

const halfPointSideLength = pointSideLength / 2;

interface Decoration3Props extends DecorationCommonProps {}

export const Decoration3 = forwardRef<AutoResizeActions, Decoration3Props>(({ className, style, color }, ref) => {
  const { width, height, domRef } = useAutoResize(ref as any);

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

  const { svgScale, points } = useMemo(() => {
    const points = getDecorationPoints(svgWH, rowPoints, rowNum);
    return {
      points,
      svgScale: [width / svgWH[0], height / svgWH[1]],
    };
  }, [width, height]);

  const classNames = useMemo(() => `dv-decoration-3${className ? ` ${className}` : ""}`, [className]);

  return (
    <div className={classNames} style={style} ref={domRef}>
      <svg
        width={`${svgWH[0]}px`}
        height={`${svgWH[1]}px`}
        style={{ transform: `scale(${svgScale[0]},${svgScale[1]})` }}
      >
        {points.map((point, i) => (
          <rect
            key={i}
            fill={mergedColor[0]}
            x={point[0] - halfPointSideLength}
            y={point[1] - halfPointSideLength}
            width={pointSideLength}
            height={pointSideLength}
          >
            {Math.random() > 0.6 && (
              <animate
                attributeName="fill"
                values={`${mergedColor.join(";")}`}
                dur={Math.random() + 1 + "s"}
                begin={Math.random() * 2}
                repeatCount="indefinite"
              />
            )}
          </rect>
        ))}
      </svg>
    </div>
  );
});

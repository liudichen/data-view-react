import { useMemo, forwardRef } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import { randomExtend, getDecorationPoints } from "@/utils";
import type { DecorationCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#7acaec", "#7acaec"];

const svgWH: [number, number] = [300, 35];

const rowNum = 1;
const rowPoints = 40;

const rectWidth = 7;
const halfRectWidth = rectWidth / 2;

function getData() {
  const [, h] = svgWH;

  const heights = new Array(rowNum * rowPoints)
    .fill(0)
    .map((foo) => (Math.random() > 0.8 ? randomExtend(0.7 * h, h) : randomExtend(0.2 * h, 0.5 * h)));

  const minHeights = new Array(rowNum * rowPoints).fill(0).map((foo, i) => heights[i] * Math.random());

  const randoms = new Array(rowNum * rowPoints).fill(0).map((foo) => Math.random() + 1.5);

  return { heights, minHeights, randoms };
}

export interface Decoration6Props extends DecorationCommonProps {}

export const Decoration6 = forwardRef<AutoResizeActions, Decoration6Props>(({ className, style, color }, ref) => {
  const { width, height, domRef } = useAutoResize(ref as any);

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

  const classNames = useMemo(() => `dv-decoration-6${className ? ` ${className}` : ""}`, [className]);

  const { points, heights, minHeights, randoms, svgScale } = useMemo(
    () => ({
      ...getData(),
      points: getDecorationPoints(svgWH, rowPoints, rowNum),
      svgScale: [width / svgWH[0], height / svgWH[1]],
    }),
    [width, height]
  );

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
            fill={mergedColor[Math.random() > 0.5 ? 0 : 1]}
            x={point[0] - halfRectWidth}
            y={point[1] - heights[i] / 2}
            width={rectWidth}
            height={heights[i]}
          >
            <animate
              attributeName="y"
              values={`${point[1] - minHeights[i] / 2};${point[1] - heights[i] / 2};${point[1] - minHeights[i] / 2}`}
              dur={`${randoms[i]}s`}
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.42,0,0.58,1;0.42,0,0.58,1"
              begin="0s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="height"
              values={`${minHeights[i]};${heights[i]};${minHeights[i]}`}
              dur={`${randoms[i]}s`}
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.42,0,0.58,1;0.42,0,0.58,1"
              begin="0s"
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </svg>
    </div>
  );
});

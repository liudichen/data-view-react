import { useMemo, forwardRef, type MutableRefObject, useRef } from "react";
import { fade } from "@jiaminghi/color";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import { uuid } from "@/utils";
import type { BorderBoxCommonProps } from "@/types";

import "./style.css";

const defaultColor = ["#2e6099", "#7ce7fd"];

export interface BorderBox12Props extends BorderBoxCommonProps {}

export const BorderBox12 = forwardRef<AutoResizeActions, BorderBox12Props>(
  ({ children, className, style, color, backgroundColor = "transparent" }, ref) => {
    const filterId = useRef(`border-box-12-filterId-${uuid()}`).current;
    const { width, height, domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color]);

    const classNames = useMemo(() => (className ? `dv-border-box-12 ${className}` : "dv-border-box-12"), [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        <svg className="dv-border-svg-container" width={width} height={height}>
          <defs>
            <filter id={filterId} height="150%" width="150%" x="-25%" y="-25%">
              <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
              <feGaussianBlur in="thicken" stdDeviation="2" result="blurred" />
              <feFlood floodColor={fade(mergedColor[1] || defaultColor[1], 70)} result="glowColor">
                <animate
                  attributeName="flood-color"
                  values={`
                ${fade(mergedColor[1] || defaultColor[1], 70)};
                ${fade(mergedColor[1] || defaultColor[1], 30)};
                ${fade(mergedColor[1] || defaultColor[1], 70)};
              `}
                  dur="3s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </feFlood>
              <feComposite in="glowColor" in2="blurred" operator="in" result="softGlowColored" />
              <feMerge>
                <feMergeNode in="softGlowColored" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {width && height && (
            <path
              fill={backgroundColor}
              strokeWidth="2"
              stroke={mergedColor[0]}
              d={`
            M15 5 L ${width - 15} 5 Q ${width - 5} 5, ${width - 5} 15
            L ${width - 5} ${height - 15} Q ${width - 5} ${height - 5}, ${width - 15} ${height - 5}
            L 15, ${height - 5} Q 5 ${height - 5} 5 ${height - 15} L 5 15
            Q 5 5 15 5
          `}
            />
          )}

          <path
            strokeWidth="2"
            fill="transparent"
            strokeLinecap="round"
            filter={`url(#${filterId})`}
            stroke={mergedColor[1]}
            d={`M 20 5 L 15 5 Q 5 5 5 15 L 5 20`}
          />

          <path
            strokeWidth="2"
            fill="transparent"
            strokeLinecap="round"
            filter={`url(#${filterId})`}
            stroke={mergedColor[1]}
            d={`M ${width - 20} 5 L ${width - 15} 5 Q ${width - 5} 5 ${width - 5} 15 L ${width - 5} 20`}
          />

          <path
            strokeWidth="2"
            fill="transparent"
            strokeLinecap="round"
            filter={`url(#${filterId})`}
            stroke={mergedColor[1]}
            d={`
          M ${width - 20} ${height - 5} L ${width - 15} ${height - 5}
          Q ${width - 5} ${height - 5} ${width - 5} ${height - 15}
          L ${width - 5} ${height - 20}
        `}
          />

          <path
            strokeWidth="2"
            fill="transparent"
            strokeLinecap="round"
            filter={`url(#${filterId})`}
            stroke={mergedColor[1]}
            d={`
          M 20 ${height - 5} L 15 ${height - 5}
          Q 5 ${height - 5} 5 ${height - 15}
          L 5 ${height - 20}
        `}
          />
        </svg>
        <div className="border-box-content">{children}</div>
      </div>
    );
  }
);

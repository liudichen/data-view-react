import { useEffect, useState, useRef, useCallback, useMemo, forwardRef, CSSProperties } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import { randomExtend, getPointDistance, uuid } from "@/utils";

import "./style.css";

interface Halo {
  /**
   * @description Whether to show halo 是否显示光晕
   * @default show = false
   */
  show?: boolean;
  /**
   * @description Halo animation duration (1s = 10) 光晕动画时长
   * @default duration = [20,30]
   */
  duration?: [number, number];
  /**
   * @description Halo color 光晕颜色
   * @default color = '#fb7293'
   */
  color?: string;
  /**
   * @description Halo radius 光晕最大半径
   * @default radius = 120
   */
  radius?: number;
}

interface Text {
  /**
   * @description Whether to show text 是否显示点名称
   * @default show = false
   */
  show?: boolean;
  /**
   * @description Text offset 名称位置偏移
   * @default offset = [0, 15]
   */
  offset?: [number, number];
  /**
   * @description Text color 名称颜色
   * @default color = '#ffdb5c'
   */
  color?: string;
  /**
   * @description Text font size 名称文字大小
   * @default fontSize = 12
   */
  fontSize?: number;
}

interface Icon {
  /**
   * @description Whether to show icon 是否显示点图标
   * @default show = false
   */
  show?: boolean;
  /**
   * @description Icon src 图标src
   * @default src = ''
   */
  src?: string;
  /**
   * @description Icon width 图标宽度
   * @default width = 15
   */
  width?: number;
  /**
   * @description Icon height 图标高度
   * @default width = 15
   */
  height?: number;
}

interface Point {
  name: string;
  coordinate: [number, number];
  halo?: Halo;
  text?: Text;
  icon?: Icon;
}

interface Line {
  /**
   * @description Line width 飞线宽度
   * @default width = 1
   */
  width?: number;
  /**
   * @description Flyline color 飞线颜色
   * @default color = '#ffde93'
   */
  color?: string;
  /**
   * @description Orbit color 轨迹颜色
   * @default orbitColor = 'rgba(103, 224, 227, .2)'
   */
  orbitColor?: string;
  /**
   * @description Flyline animation duration 飞线动画时长
   * @default duration = [20, 30]
   */
  duration?: [number, number];
  /**
   * @description Flyline radius 飞线显示半径
   * @default radius = 100
   */
  radius?: number;
}

interface Flyline extends Line {
  source: string;
  target: string;
}

interface FlylineWithPath extends Flyline {
  d: string;
  path: [[number, number], [number, number], [number, number]];
  key: string;
}

interface FlyLineChartEnhancedConfig {
  /**
   * @description Flyline chart points 飞线点
   * @default points = []
   */
  points?: Point[];
  /**
   * @description Lines 飞线
   * @default lines = []
   */
  lines?: Flyline[];
  /**
   * @description Global halo configuration 全局光晕配置
   * @default halo = {show:false,duration:[20,30],color:'#fb7293',radius:120}
   */
  halo?: Halo;
  /**
   * @description Global text configuration 全局文本配置
   * @default text = {show:false,offset:[0,15],color:'#ffdb5c',fontSize:12}
   */
  text?: Text;
  /**
   * @description Global icon configuration 全局图标配置
   * @default icon = {show:false,src:"",width:15,height:15}
   */
  icon?: Icon;
  /**
   * @description Global line configuration 全局飞线配置
   * @default line = {width: 1,color: '#ffde93',orbitColor: "rgba(103, 224, 227, .2)",duration: [20, 30],radius: 100}
   */
  line?: Line;
  /**
   * @description Back ground image url 背景图src
   * @default bgImgSrc = ''
   */
  bgImgSrc?: string;
  /**
   * @description K value 飞线收束程度 (决定了飞线的收束程度，其取值范围为-1 - 1，当为负值时飞线呈凸形聚合，为正值时飞线呈凹形聚合)
   * @default k = -0.5
   * @example k = -1 ~ 1
   */
  k?: number;
  /**
   * @description Flyline curvature 飞线曲率 (决定了飞线的弯曲程度，其取值范围为1 - 10，该值越小，飞线曲率越大，该值越大，飞线曲率越小)
   * @default curvature = 5
   */
  curvature?: number;
  /**
   * @description Relative points position 使用相对坐标? (用于控制是否启用相对坐标模式，因为飞线图组件的宽高可能是自适应的，如按百分比计算宽高，使用相对坐标模式可使飞线点的位置同样按飞线图组件宽高的百分比计算。默认启用相对坐标模式，请根据情况，选用Dev模式下输出的点坐标信息)
   * @default relative = true
   */
  relative?: boolean;
}

const defaultConfig: Required<FlyLineChartEnhancedConfig> = {
  points: [],
  lines: [],
  halo: {
    show: false,
    duration: [20, 30],
    color: "#fb7293",
    radius: 120,
  },
  text: {
    show: false,
    offset: [0, 15],
    color: "#ffdb5c",
    fontSize: 12,
  },
  icon: {
    show: false,
    src: "",
    width: 15,
    height: 15,
  },
  line: {
    width: 1,
    color: "#ffde93",
    orbitColor: "rgba(103, 224, 227, .2)",
    duration: [20, 30],
    radius: 100,
  },
  bgImgSrc: "",
  k: -0.5,
  curvature: 5,
  relative: true,
};

function getKLinePointByx(k: number, [lx, ly]: [number, number], x: number) {
  const y = ly - k * lx + k * x;

  return [x, y];
}

export interface FlyLineChartEnhancedProps {
  className?: string;
  style?: CSSProperties;
  dev?: boolean;
  config?: FlyLineChartEnhancedConfig;
}

/**
 * 飞线图增强版
 */
export const FlyLineChartEnhanced = forwardRef<AutoResizeActions, FlyLineChartEnhancedProps>(
  ({ config, dev = false, className, style }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const { unique, flylineGradientId, haloGradientId } = useRef({
      unique: Math.random(),
      flylineGradientId: `flyline-gradient-id-${uuid()}`,
      haloGradientId: `halo-gradient-id-${uuid()}`,
    }).current;

    const { mergedConfig, flylinePoints, flylines } = useMemo(calcData, [config, width, height]);

    const [flylineLengths, setFlylineLengths] = useState<number[]>([]);

    const pathDomRef = useRef<SVGPathElement[]>([]);

    function calcData() {
      const mergedConfig = getMergedConfig();

      const flylinePoints = getFlylinePoints(mergedConfig);

      const flylines = getLinePaths(mergedConfig);

      return { mergedConfig, flylinePoints, flylines };
    }

    function getMergedConfig() {
      const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});
      const { points, lines, halo, text, icon, line } = mergedConfig;

      mergedConfig.points = points.map((item) => {
        item.halo = deepMerge(deepClone(halo, true), item.halo || {});
        item.text = deepMerge(deepClone(text, true), item.text || {});
        item.icon = deepMerge(deepClone(icon, true), item.icon || {});
        return item;
      });

      mergedConfig.lines = lines.map((item) => deepMerge<Flyline>(deepClone(line, true), item));

      return mergedConfig;
    }

    function getFlylinePoints(mergedConfig: typeof defaultConfig) {
      const { relative, points } = mergedConfig;

      return points.map((item, i) => {
        const coordinate = relative ? [item.coordinate[0] * width, item.coordinate[1] * height] : item.coordinate;
        const point = {
          ...item,
          coordinate,
          key: `${coordinate.toString()}${i}`,
          halo: { ...(item.halo || {}), time: randomExtend(...item.halo!.duration!) / 10 },
          text: {
            ...(item.text || {}),
            x: coordinate[0] + item.text!.offset![0],
            y: coordinate[1] + item.text!.offset![1],
          },
          icon: {
            ...(item.icon || {}),
            x: coordinate[0] - item.icon!.width! / 2,
            y: coordinate[1] - item.icon!.height! / 2,
          },
        };
        return point;
      });
    }

    function getLinePaths(mergedConfig: typeof defaultConfig) {
      const { points, lines } = mergedConfig;

      return lines.map((item) => {
        const { source, target, duration } = item;
        const sourcePoint = points.find(({ name }) => name === source)!.coordinate;
        const targetPoint = points.find(({ name }) => name === target)!.coordinate;
        const path = getPath(sourcePoint, targetPoint, mergedConfig).map((item) =>
          item.map((v: number) => parseFloat(v.toFixed(10)))
        );
        const d = `M${path[0].toString()} Q${path[1].toString()} ${path[2].toString()}`;
        const key = `path${path.toString()}`;
        const time = randomExtend(...duration!) / 10;

        return { ...item, path, key, d, time };
      });
    }
    function getControlPoint(
      [sx, sy]: [number, number],
      [ex, ey]: [number, number],
      { curvature, k }: typeof defaultConfig
    ) {
      const [mx, my] = [(sx + ex) / 2, (sy + ey) / 2];
      const distance = getPointDistance([sx, sy], [ex, ey]);
      const targetLength = distance / curvature;
      const disDived = targetLength / 2;
      let [dx, dy] = [mx, my];

      do {
        dx += disDived;
        dy = getKLinePointByx(k, [mx, my], dx)[1];
      } while (getPointDistance([mx, my], [dx, dy]) < targetLength);

      return [dx, dy];
    }
    function getPath(start: [number, number], end: [number, number], mergedConfig: typeof defaultConfig) {
      const controlPoint = getControlPoint(start, end, mergedConfig);

      return [start, controlPoint, end];
    }

    const consoleClickPos = useCallback(
      ({ offsetX, offsetY }: any) => {
        if (!dev) return;

        const relativeX = (offsetX / width).toFixed(2);
        const relativeY = (offsetY / height).toFixed(2);

        console.warn(
          `dv-flyline-chart-enhanced DEV: \n Click Position is [${offsetX}, ${offsetY}] \n Relative Position is [${relativeX}, ${relativeY}]`
        );
      },
      [width, height, dev]
    );

    useEffect(() => {
      const lengths = flylines.map((foo, i) => pathDomRef.current[i].getTotalLength());

      setFlylineLengths(lengths);
    }, [flylines]);

    const classNames = useMemo(() => `dv-flyline-chart-enhanced${className ? ` ${className}` : ""}`, [className]);

    return (
      <div
        className={classNames}
        ref={domRef}
        style={{ backgroundImage: `url(${mergedConfig ? mergedConfig.bgImgSrc : ""})`, ...style }}
        onClick={consoleClickPos}
      >
        {flylines.length && (
          <svg width={width} height={height}>
            <defs>
              <radialGradient id={flylineGradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={haloGradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#fff" stopOpacity="1" />
              </radialGradient>
            </defs>

            {/* points */}
            {flylinePoints.map((point, i) => (
              <g key={i}>
                <defs>
                  {point.halo.show && (
                    <circle id={`halo${unique}${point.key}`} cx={point.coordinate[0]} cy={point.coordinate[1]}>
                      <animate
                        attributeName="r"
                        values={`1;${point.halo.radius}`}
                        dur={`${point.halo.time}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="1;0"
                        dur={`${point.halo.time}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </defs>

                {/* halo gradient mask */}
                <mask id={`mask${unique}${point.key}`}>
                  {point.halo.show && <use href={`#halo${unique}${point.key}`} fill={`url(#${haloGradientId})`} />}
                </mask>

                {/* point halo */}
                {point.halo.show && (
                  <use
                    href={`#halo${unique}${point.key}`}
                    fill={point.halo.color}
                    mask={`url(#mask${unique}${point.key})`}
                  />
                )}

                {/* point icon */}
                {point.icon.show && (
                  <image
                    href={point.icon.src}
                    width={point.icon.width}
                    height={point.icon.height}
                    x={point.icon.x}
                    y={point.icon.y}
                  />
                )}

                {/* point text */}
                {point.text.show && (
                  <text
                    style={{ fontSize: `${point.text.fontSize}px`, color: `${point.text.color}` }}
                    fill={point.text.color}
                    x={point.text.x}
                    y={point.text.y}
                  >
                    {point.name}
                  </text>
                )}
              </g>
            ))}

            {/* flylines */}
            {flylines.map((line, i) => (
              <g key={i}>
                <defs>
                  <path id={line.key} ref={(e) => (pathDomRef.current[i] = e!)} d={line.d} fill="transparent" />
                </defs>

                {/* orbit line */}
                <use href={`#${line.key}`} strokeWidth={line.width} stroke={line.orbitColor} />

                {/* fly line gradient mask */}
                <mask id={`mask${unique}${line.key}`}>
                  <circle cx="0" cy="0" r={line.radius} fill={`url(#${flylineGradientId})`}>
                    <animateMotion dur={line.time} path={line.d} rotate="auto" repeatCount="indefinite" />
                  </circle>
                </mask>

                {/* fly line */}
                {flylineLengths[i] && (
                  <use
                    href={`#${line.key}`}
                    strokeWidth={line.width}
                    stroke={line.color}
                    mask={`url(#mask${unique}${line.key})`}
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      from={`0, ${flylineLengths[i]}`}
                      to={`${flylineLengths[i]}, 0`}
                      dur={line.time}
                      repeatCount="indefinite"
                    />
                  </use>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>
    );
  }
);

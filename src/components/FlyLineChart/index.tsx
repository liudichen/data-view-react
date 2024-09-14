import { useEffect, useState, useRef, useCallback, useMemo, forwardRef, type CSSProperties } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import { randomExtend, getPointDistance, uuid } from "@/utils";
import type { Point } from "@/types";

import "./style.css";

const defaultConfig: FlyLineChartConfig = {
  /**
   * @description Flyline chart center point
   * @type {Array<Number>}
   * @default centerPoint = [0, 0]
   */
  centerPoint: [0, 0],
  /**
   * @description Flyline start points
   * @type {Array<Array<Number>>}
   * @default points = []
   * @example points = [[10, 10], [100, 100]]
   */
  points: [],
  /**
   * @description Flyline width
   * @type {Number}
   * @default lineWidth = 1
   */
  lineWidth: 1,
  /**
   * @description Orbit color
   * @type {String}
   * @default orbitColor = 'rgba(103, 224, 227, .2)'
   */
  orbitColor: "rgba(103, 224, 227, .2)",
  /**
   * @description Flyline color
   * @type {String}
   * @default orbitColor = '#ffde93'
   */
  flylineColor: "#ffde93",
  /**
   * @description K value
   * @type {Number}
   * @default k = -0.5
   * @example k = -1 ~ 1
   */
  k: -0.5,
  /**
   * @description Flyline curvature
   * @type {Number}
   * @default curvature = 5
   */
  curvature: 5,
  /**
   * @description Flyline radius
   * @type {Number}
   * @default flylineRadius = 100
   */
  flylineRadius: 100,
  /**
   * @description Flyline animation duration
   * @type {Array<Number>}
   * @default duration = [20, 30]
   */
  duration: [20, 30],
  /**
   * @description Relative points position
   * @type {Boolean}
   * @default relative = true
   */
  relative: true,
  /**
   * @description Back ground image url
   * @type {String}
   * @default bgImgUrl = ''
   * @example bgImgUrl = './img/bg.jpg'
   */
  bgImgUrl: "",
  /**
   * @description Text configuration
   * @type {Object}
   */
  text: {
    /**
     * @description Text offset
     * @type {Array<Number>}
     * @default offset = [0, 15]
     */
    offset: [0, 15],
    /**
     * @description Text color
     * @type {String}
     * @default color = '#ffdb5c'
     */
    color: "#ffdb5c",
    /**
     * @description Text font size
     * @type {Number}
     * @default fontSize = 12
     */
    fontSize: 12,
  },
  /**
   * @description Halo configuration
   * @type {Object}
   */
  halo: {
    /**
     * @description Weather to show halo
     * @type {Boolean}
     * @default show = true
     * @example show = true | false
     */
    show: true,
    /**
     * @description Halo animation duration (10 = 1s)
     * @type {Number}
     * @default duration = 30
     */
    duration: 30,
    /**
     * @description Halo color
     * @type {String}
     * @default color = '#fb7293'
     */
    color: "#fb7293",
    /**
     * @description Halo max radius
     * @type {Number}
     * @default radius = 120
     */
    radius: 120,
  },
  /**
   * @description Center point img configuration
   * @type {Object}
   */
  centerPointImg: {
    /**
     * @description Center point img width
     * @type {Number}
     * @default width = 40
     */
    width: 40,
    /**
     * @description Center point img height
     * @type {Number}
     * @default height = 40
     */
    height: 40,
    /**
     * @description Center point img url
     * @type {String}
     * @default url = ''
     */
    url: "",
  },
  /**
   * @description Points img configuration
   * @type {Object}
   * @default radius = 120
   */
  pointsImg: {
    /**
     * @description Points img width
     * @type {Number}
     * @default width = 15
     */
    width: 15,
    /**
     * @description Points img height
     * @type {Number}
     * @default height = 15
     */
    height: 15,
    /**
     * @description Points img url
     * @type {String}
     * @default url = ''
     */
    url: "",
  },
};

function getControlPoint([sx, sy]: Point, [ex, ey]: Point, { curvature, k }: FlyLineChartMergedConfig) {
  const [mx, my] = [(sx + ex) / 2, (sy + ey) / 2];

  const distance = getPointDistance([sx, sy], [ex, ey]);

  const targetLength = distance / curvature;
  const disDived = targetLength / 2;

  let [dx, dy] = [mx, my];

  do {
    dx += disDived;
    dy = my - k * mx + k * dx;
  } while (getPointDistance([mx, my], [dx, dy]) < targetLength);

  return [dx, dy];
}

type FlyLineChartConfig = {
  /**
   * @description Flyline chart center point 中心点坐标
   * @default centerPoint = [0, 0]
   */
  centerPoint?: Point;
  /**
   * @description Flyline start points 飞线起始点数据
   * @default points = []
   * @example points = [[10, 10], [100, 100]]
   */
  points?: (Point | { position: Point; text: string })[];
  /**
   * @description Flyline width 飞线宽度
   * @default lineWidth = 1
   */
  lineWidth?: number;
  /**
   * @description Orbit color 轨迹颜色(如果想要隐藏轨迹线，可以设置为transparent)
   * @default orbitColor = 'rgba(103, 224, 227, .2)'
   */
  orbitColor?: string;
  /**
   * @description Flyline color 飞线颜色
   * @default orbitColor = '#ffde93'
   */
  flylineColor?: string;
  /**
   * @description K value 飞线收束程度(决定了飞线的收束程度，其取值范围为-1 - 1，当为负值时飞线呈凸形聚合，为正值时飞线呈凹形聚合)
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
   * @description Flyline radius 飞线显示半径 (控制了飞线的显示区域半径，该值越大，飞线显示范围越大，飞线越长，该值越小，飞线越短)
   * @default flylineRadius = 100
   */
  flylineRadius?: number;
  /**
   * @description Flyline animation duration 飞线动画时长 (用于计算每一条飞线的动画时长（10 = 1s），duration[0]用于控制动画最短时长，duration[1]用于控制动画最长时长，飞线的动画时长将在此范围随机。如果想要每一条飞线的动画时长都相等可以将他们的值设为相同的)
   * @default duration = [20, 30]
   */
  duration?: [number, number];
  /**
   * @description Relative points position 使用相对坐标? (用于控制是否启用相对坐标模式，因为飞线图组件的宽高可能是自适应的，如按百分比计算宽高，使用相对坐标模式可使飞线点的位置同样按飞线图组件宽高的百分比计算。默认启用相对坐标模式，请根据情况，选用 Dev 模式下输出的点坐标信息)
   * @default relative = true
   */
  relative?: boolean;
  /**
   * @description Back ground image url 背景图url
   * @type {String}
   * @default bgImgUrl = ''
   * @example bgImgUrl = './img/bg.jpg'
   */
  bgImgUrl?: string;
  /**
   * @description Text configuration 文本配置项
   * @default text = {offset:[0,15],color:"#ffdb5c",fontSize:12}
   */
  text?: {
    /**
     * @description Text offset 文本位置偏移
     * @default offset = [0, 15]
     */
    offset?: [number, number];
    /**
     * @description Text color 文本颜色
     * @default color = '#ffdb5c'
     */
    color?: string;
    /**
     * @description Text font size 文本文字大小
     * @default fontSize = 12
     */
    fontSize?: number;
  };
  /**
   * @description Halo configuration 光晕环配置项
   * @default halo = {show:true,duration:30,color:'#fb7293',radius:120}
   */
  halo?: {
    /**
     * @description Weather to show halo 是否显示光晕环
     * @default show = true
     * @example show = true | false
     */
    show?: boolean;
    /**
     * @description Halo animation duration (10 = 1s) 动画时长
     * @default duration = 30
     */
    duration?: number;
    /**
     * @description Halo color 光晕颜色
     * @default color = '#fb7293'
     */
    color?: string;
    /**
     * @description Halo max radius 光晕最大半径
     * @default radius = 120
     */
    radius?: number;
  };
  /**
   * @description Center point img configuration 中心点图片配置
   * @default centerPointImg = {width:40,height:40,url:''}
   */
  centerPointImg?: {
    /**
     * @description Center point img width 图片宽度
     * @default width = 40
     */
    width?: number;
    /**
     * @description Center point img height 图片高度
     * @default height = 40
     */
    height?: number;
    /**
     * @description Center point img url 图片url
     * @default url = ''
     */
    url?: string;
  };
  /**
   * @description Points img configuration 飞线点图片配置
   * @default pointsImg = {width:15,height:15,url:''}
   */
  pointsImg?: {
    /**
     * @description Points img width 图片宽度
     * @default width = 15
     */
    width?: number;
    /**
     * @description Points img height 图片高度
     * @default height = 15
     */
    height?: number;
    /**
     * @description Points img url 图片url
     * @default url = ''
     */
    url?: string;
  };
};

type FlyLineChartMergedConfig = Required<Omit<FlyLineChartConfig, "points">> & {
  points: { text: string; position: Point }[];
};

export interface FlyLineChartProps {
  className?: string;
  style?: CSSProperties;
  config?: FlyLineChartConfig;
  dev?: boolean;
}

/**
 * 飞线图 （ 建议使用飞线图增强版 ）
 */
export const FlyLineChart = forwardRef<AutoResizeActions, FlyLineChartProps>(
  ({ config, dev = false, className, style }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const { unique, gradientId, gradient2Id } = useRef({
      unique: Math.random(),
      gradientId: `gradient-id-${uuid()}`,
      gradient2Id: `gradient2-id-${uuid()}`,
    }).current;

    const { mergedConfig, paths, times, texts } = useMemo(() => {
      function getMergedConfig() {
        const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});

        mergedConfig.points = mergedConfig.points.map((item) => {
          if (Array.isArray(item)) {
            return { position: item, text: "" };
          }

          return item;
        });

        return mergedConfig as FlyLineChartMergedConfig;
      }
      const mergedConfig = getMergedConfig();
      function createFlylinePaths(mergedConfig: FlyLineChartMergedConfig) {
        let { centerPoint, relative } = mergedConfig;
        let points = mergedConfig.points.map(({ position }) => position);

        if (relative) {
          centerPoint = [width * centerPoint[0], height * centerPoint[1]];
          points = points.map(([x, y]) => [width * x, height * y]);
        }

        return points.map((point) => {
          const controlPoint = getControlPoint(centerPoint, point, mergedConfig);

          return [point, controlPoint, centerPoint];
        });
      }
      const paths = createFlylinePaths(mergedConfig);
      const { duration, points } = mergedConfig;

      const times = points.map((foo) => randomExtend(...duration) / 10);

      const texts = points.map((point) => (point as unknown as { text: string; value: number })?.text);

      return { mergedConfig, paths, times, texts };
    }, [config, width, height]);

    const [lengths, setLengths] = useState<number[]>([]);

    const pathDomRef = useRef<SVGPathElement[]>([]);

    const consoleClickPos = useCallback(
      ({ offsetX, offsetY }: any) => {
        if (!dev) return;

        const relativeX = (offsetX / width).toFixed(2);
        const relativeY = (offsetY / height).toFixed(2);

        console.warn(
          `dv-flyline-chart DEV: \n Click Position is [${offsetX}, ${offsetY}] \n Relative Position is [${relativeX}, ${relativeY}]`
        );
      },
      [width, height, dev]
    );

    useEffect(() => {
      const lengths = paths.map((foo, i) => pathDomRef.current[i].getTotalLength());

      setLengths(lengths);
    }, [paths]);

    const classNames = useMemo(() => `dv-flyline-chart${className ? ` ${className}` : ""}`, [className]);

    return (
      <div
        className={classNames}
        ref={domRef}
        style={{
          backgroundImage: `url(${mergedConfig ? mergedConfig.bgImgUrl : ""})`,
          ...style,
        }}
        onClick={consoleClickPos}
      >
        {!!mergedConfig && (
          <svg width={width} height={height}>
            <defs>
              <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={gradient2Id} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#fff" stopOpacity="1" />
              </radialGradient>

              {!!paths[0] && (
                <circle id={`circle${paths[0].toString()}`} cx={paths[0][2][0]} cy={paths[0][2][1]}>
                  <animate
                    attributeName="r"
                    values={`1;${mergedConfig.halo.radius}`}
                    dur={mergedConfig.halo.duration! / 10 + "s"}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0"
                    dur={mergedConfig.halo.duration! / 10 + "s"}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </defs>

            {!!paths[0] && (
              <image
                href={mergedConfig.centerPointImg.url}
                width={mergedConfig.centerPointImg.width}
                height={mergedConfig.centerPointImg.height}
                x={paths[0][2][0] - mergedConfig.centerPointImg.width! / 2}
                y={paths[0][2][1] - mergedConfig.centerPointImg.height! / 2}
              />
            )}

            <mask id={`maskhalo${paths[0].toString()}`}>
              {!!paths[0] && <use href={`#circle${paths[0].toString()}`} fill={`url(#${gradient2Id})`} />}
            </mask>

            {!!paths[0] && mergedConfig.halo.show && (
              <use
                href={`#circle${paths[0].toString()}`}
                fill={mergedConfig.halo.color}
                mask={`url(#maskhalo${paths[0].toString()})`}
              />
            )}

            {paths.map((path, i) => (
              <g key={i}>
                <defs>
                  <path
                    id={`path${path.toString()}`}
                    ref={(e) => (pathDomRef.current[i] = e!)}
                    d={`M${path[0].toString()} Q${path[1].toString()} ${path[2].toString()}`}
                    fill="transparent"
                  />
                </defs>

                <use
                  href={`#path${path.toString()}`}
                  strokeWidth={mergedConfig.lineWidth}
                  stroke={mergedConfig.orbitColor}
                />

                {lengths[i] && (
                  <use
                    href={`#path${path.toString()}`}
                    strokeWidth={mergedConfig.lineWidth}
                    stroke={mergedConfig.flylineColor}
                    mask={`url(#mask${unique}${path.toString()})`}
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      from={`0, ${lengths[i]}`}
                      to={`${lengths[i]}, 0`}
                      dur={times[i] || 0}
                      repeatCount="indefinite"
                    />
                  </use>
                )}

                <mask id={`mask${unique}${path.toString()}`}>
                  <circle cx="0" cy="0" r={mergedConfig.flylineRadius} fill={`url(#${gradientId})`}>
                    <animateMotion
                      dur={times[i] || 0}
                      path={`M${path[0].toString()} Q${path[1].toString()} ${path[2].toString()}`}
                      rotate="auto"
                      repeatCount="indefinite"
                    />
                  </circle>
                </mask>

                <image
                  href={mergedConfig.pointsImg.url}
                  width={mergedConfig.pointsImg.width}
                  height={mergedConfig.pointsImg.height}
                  x={path[0][0] - mergedConfig.pointsImg.width! / 2}
                  y={path[0][1] - mergedConfig.pointsImg.height! / 2}
                />

                <text
                  style={{ fontSize: `${mergedConfig.text.fontSize}px` }}
                  fill={mergedConfig.text.color}
                  x={path[0][0] + mergedConfig.text.offset![0]}
                  y={path[0][1] + mergedConfig.text.offset![1]}
                >
                  {texts[i]}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    );
  }
);

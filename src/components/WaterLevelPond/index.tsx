import { useEffect, useRef, useMemo, useState, CSSProperties } from "react";
import { CRender } from "@jiaminghi/c-render";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { co, uuid } from "@/utils";

import "./style.css";

const defaultConfig: WaterLevelPondConfig = {
  data: [],
  shape: "rect",
  waveNum: 3,
  waveHeight: 40,
  waveOpacity: 0.4,
  colors: ["#3DE7C9", "#00BAFF"],
  formatter: "{value}%",
};

function drawed({ shape: { points } }: any, { ctx, area }: CRender) {
  const firstPoint = points[0];
  const lastPoint = points.slice(-1)[0];

  const h = area[1];

  ctx.lineTo(lastPoint[0], h);
  ctx.lineTo(firstPoint[0], h);

  ctx.closePath();

  ctx.fill();
}

function mergeOffset([x, y]: number[], [ox, oy]: number[]) {
  return [x + ox, y + oy];
}

function calcSvgBorderGradient({ colors }: WaterLevelPondConfig) {
  const colorNum = colors!.length;

  const colorOffsetGap = 100 / (colorNum - 1);

  return colors!.map((c, i) => [colorOffsetGap * i, c]) as [number, string][];
}

function calcDetails({ data, formatter }: WaterLevelPondConfig) {
  if (!data?.length) {
    return "";
  }

  const maxValue = Math.max(...data);

  return formatter!.replace("{value}", `${maxValue}`);
}

function getWaveShapes({ waveNum, waveHeight, data }: WaterLevelPondConfig, [w, h]: [number, number]) {
  const pointsNum = waveNum! * 4 + 4;

  const pointXGap = w / waveNum! / 2;

  return data!.map((v) => {
    let points = new Array(pointsNum).fill(0).map((foo, j) => {
      const x = w - pointXGap * j;

      const startY = (1 - v / 100) * h;

      const y = j % 2 === 0 ? startY : startY - waveHeight!;

      return [x, y];
    });

    points = points.map((p) => mergeOffset(p, [pointXGap * 2, 0]));

    return { points };
  });
}

function getWaveStyle({ colors, waveOpacity }: WaterLevelPondConfig, area: CRender["area"]) {
  return {
    gradientColor: colors,
    gradientType: "linear",
    gradientParams: [0, 0, 0, area[1]],
    gradientWith: "fill",
    opacity: waveOpacity,
    translate: [0, 0],
  };
}

function getWave(mergedConfig: WaterLevelPondConfig, renderer: CRender) {
  const area = renderer.area;
  const shapes = getWaveShapes(mergedConfig, area);
  const style = getWaveStyle(mergedConfig, area);

  return shapes.map((shape) =>
    renderer.add({
      name: "smoothline",
      animationFrame: 300,
      shape,
      style,
      drawed,
    } as any)
  );
}

function* animationWave(waves: any, renderer: CRender) {
  waves.forEach((graph: any) => {
    graph.attr("style", { translate: [0, 0] });

    graph.animation(
      "style",
      {
        translate: [renderer.area[0], 0],
      },
      true
    );
  });

  yield renderer.launchAnimation();
}

interface WaterLevelPondConfig {
  /**
   * 水位位置(可以有多个水位，但默认显示值最大的水位信息)
   * @default data = []
   */
  data?: number[];
  /**
   * 水位图形状
   * @default shape = 'rect'
   */
  shape?: "rect" | "roundRect" | "round";
  /**
   * 水位图配色(颜色支持hex|rgb|rgba|颜色关键字等四种类型, 自动应用渐变色，若不想使用渐变色，请配置两个相同的颜色)
   * @default colors = ['#00BAFF', '#3DE7C9']
   * @example colors = ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'red']
   */
  colors?: string[];
  /**
   * 波浪数量
   * @default waveNum = 3
   */
  waveNum?: number;
  /**
   * 波浪高度
   * @default waveHeight = 40
   */
  waveHeight?: number;
  /**
   * 波浪透明度
   * @default waveOpacity = 0.4
   */
  waveOpacity?: number;
  /**
   * 信息格式化(自动使用最大的水位值替换字符串中的'{value}'标记)
   * @default formatter = '{value}%'
   */
  formatter?: string;
}

export interface WaterLevelPondProps {
  config?: WaterLevelPondConfig;
  className?: string;
  style?: CSSProperties;
}

/** @description 水位图 */
export const WaterLevelPond = ({ config, className, style }: WaterLevelPondProps) => {
  const [renderer, setRenderer] = useState<CRender>();

  const gradientId = useRef(`water-level-pond-${uuid()}`).current;

  const domRef = useRef(null);

  const mergedConfig = useMemo(() => deepMerge(deepClone(defaultConfig, true), config || {}), [config]);

  const svgBorderGradient = useMemo(() => calcSvgBorderGradient(mergedConfig), [mergedConfig]);

  const details = useMemo(() => calcDetails(mergedConfig), [mergedConfig]);

  const radius = useMemo(() => {
    const { shape } = mergedConfig;

    if (shape === "round") return "50%";

    if (shape === "rect") return "0";

    if (shape === "roundRect") return "10px";

    return "0";
  }, [mergedConfig]);

  const shape = useMemo(() => {
    const { shape } = mergedConfig;

    return shape || "rect";
  }, [mergedConfig]);

  useEffect(() => {
    let innerRenderer = renderer;

    if (!renderer) {
      innerRenderer = new CRender(domRef.current!);

      setRenderer(innerRenderer);
    }

    function* loop() {
      yield new Promise((resolve) => setTimeout(resolve, 30));

      const wave = getWave(mergedConfig, innerRenderer!);

      while (true) {
        // @ts-ignore
        yield* animationWave(wave, innerRenderer);

        if (!innerRenderer?.graphs?.length) return;
      }
    }

    const { end } = co(loop);

    return () => {
      innerRenderer?.delAllGraph();

      // 处理 renderer.launchAnimation 返回 undefined，导致长时间占用主线程（待 cender 下版本，处理后删除下面代码）
      innerRenderer?.graphs.forEach((_) => _.pauseAnimation());
      innerRenderer!.animationStatus = false;

      end?.();
    };
  }, [mergedConfig]);

  const classNames = useMemo(() => `dv-water-pond-level${className ? ` ${className}` : ""}`, [className]);

  return (
    <div className={classNames} style={style}>
      {!!renderer && (
        <svg>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              {svgBorderGradient.map((lc) => (
                <stop key={lc[0]} offset={lc[0]} stopColor={lc[1]} />
              ))}
            </linearGradient>
          </defs>

          <text
            stroke={`url(#${gradientId})`}
            fill={`url(#${gradientId})`}
            x={renderer.area[0] / 2 + 8}
            y={renderer.area[1] / 2 + 8}
          >
            {details}
          </text>

          {!shape || shape === "round" ? (
            <ellipse
              cx={renderer.area[0] / 2 + 8}
              cy={renderer.area[1] / 2 + 8}
              rx={renderer.area[0] / 2 + 5}
              ry={renderer.area[1] / 2 + 5}
              stroke={`url(#${gradientId})`}
            />
          ) : (
            <rect
              x="2"
              y="2"
              rx={shape === "roundRect" ? 10 : 0}
              ry={shape === "roundRect" ? 10 : 0}
              width={renderer.area[0] + 12}
              height={renderer.area[1] + 12}
              stroke={`url(#${gradientId})`}
            />
          )}
        </svg>
      )}

      <canvas ref={domRef} style={{ borderRadius: `${radius}` }} />
    </div>
  );
};

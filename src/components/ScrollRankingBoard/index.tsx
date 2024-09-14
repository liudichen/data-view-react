import { useEffect, useRef, useState, useMemo, forwardRef, type CSSProperties } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import { co } from "@/utils";

import "./style.css";

const defaultConfig: ScrollRankingBoardConfig = {
  data: [],
  rowNum: 5,
  waitTime: 2000,
  carousel: "single",
  unit: "",
  sort: true,
  valueFormatter: undefined,
};

function calcRows({ data = [], rowNum, sort }: ScrollRankingBoardConfig) {
  sort &&
    data.sort((x, y) => {
      if (x.value === y.value) return 0;
      if (x.value > y.value) return -1;
      return 1;
    });

  const value = data.map(({ value }) => value);

  const min = Math.min(...value) || 0;

  // 最小值的绝对值
  const minAbs = Math.abs(min);

  const max = Math.max(...value) || 0;

  // 最大值的绝对值
  const maxAbs = Math.abs(max);

  // 总数为最大值与最小值的绝对值相加
  const total = maxAbs + minAbs;

  data = data.map((row, i) => ({
    ...row,
    ranking: i + 1,
    percent: total && ((row.value + minAbs) / total) * 100,
  }));

  const rowLength = data.length;

  if (rowLength > rowNum! && rowLength < 2 * rowNum!) {
    data = [...data, ...data];
  }

  data = data.map((d, i) => ({ ...d, scroll: i }));

  return data;
}

type ScrollRankingBoardConfig = {
  /**
   * 表数据
   */
  data?: { name: string; value: number }[];
  /**
   * 表行数
   * @default rowNum = 5
   */
  rowNum?: number;
  /**
   * 轮播时间间隔(ms)
   * @default waitTime = 2000
   */
  waitTime?: number;
  /**
   * 轮播类型
   * @default carousel = 'single'
   */
  carousel?: "single" | "page";
  /**
   * 数值单位
   * @default '''
   */
  unit?: string;
  /**
   * 是否自动排序
   * @default sort = true
   */
  sort?: boolean;
  valueFormatter?: (value: number) => string;
};

export interface ScrollRankingBoardProps {
  config?: ScrollRankingBoardConfig;
  className?: string;
  style?: CSSProperties;
}

/**
 * @description 排行轮播表
 */
export const ScrollRankingBoard = forwardRef<AutoResizeActions, ScrollRankingBoardProps>(
  ({ config, className, style }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as any);

    const [state, setState] = useState<{ mergedConfig: ScrollRankingBoardConfig; rows: any[]; heights: number[] }>({
      mergedConfig: null as unknown as ScrollRankingBoardConfig,

      rows: [],

      heights: [],
    });

    const { mergedConfig, rows, heights } = state;

    const stateRef = useRef({
      ...state,
      rowsData: [],
      avgHeight: 0,
      animationIndex: 0,
    });

    const heightRef = useRef(height);

    Object.assign(stateRef.current, state);

    function onResize(onresize = false) {
      if (!mergedConfig) return;

      const heights = calcHeights(mergedConfig, onresize);

      if (heights !== undefined) {
        Object.assign(stateRef.current, { heights });
        setState((state) => ({ ...state, heights }));
      }
    }

    function calcData() {
      const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});

      const rows = calcRows(mergedConfig);

      const heights = calcHeights(mergedConfig);

      const data = { mergedConfig, rows };

      heights !== undefined && Object.assign(data, { heights });

      Object.assign(stateRef.current, data, { rowsData: rows, animationIndex: 0 });

      setState((state) => ({ ...state, ...data }));
    }

    function calcHeights({ rowNum, data }: ScrollRankingBoardConfig, onresize = false) {
      const avgHeight = height / rowNum!;

      Object.assign(stateRef.current, { avgHeight });

      if (!onresize) {
        return new Array(data!.length).fill(avgHeight);
      }
    }

    function* animation(start = false) {
      let {
        avgHeight,
        animationIndex,
        mergedConfig: { waitTime, carousel, rowNum },
        rowsData,
      } = stateRef.current;

      const rowLength = rowsData.length;

      if (start) yield new Promise((resolve) => setTimeout(resolve, waitTime));

      const animationNum = carousel === "single" ? 1 : rowNum;

      let rows = rowsData.slice(animationIndex);
      rows.push(...rowsData.slice(0, animationIndex));
      rows = rows.slice(0, rowNum! + 1);

      const heights = new Array(rowLength).fill(avgHeight);
      setState((state) => ({ ...state, rows, heights }));

      yield new Promise((resolve) => setTimeout(resolve, 300));

      animationIndex += animationNum!;

      const back = animationIndex - rowLength;
      if (back >= 0) animationIndex = back;

      const newHeights = [...heights];
      newHeights.splice(0, animationNum!, ...new Array(animationNum).fill(0));

      Object.assign(stateRef.current, { animationIndex });
      setState((state) => ({ ...state, heights: newHeights }));
    }

    useEffect(() => {
      calcData();

      let start = true;

      function* loop() {
        while (true) {
          // @ts-ignore
          yield* animation(start);

          start = false;

          const { waitTime } = stateRef.current.mergedConfig;

          yield new Promise((resolve) => setTimeout(resolve, waitTime! - 300));
        }
      }

      const {
        mergedConfig: { rowNum },
        rows: rowsData,
      } = stateRef.current;

      const rowLength = rowsData.length;

      if (rowNum! >= rowLength) return;

      return co(loop).end;
    }, [config, domRef.current]);

    useEffect(() => {
      if (heightRef.current === 0 && height !== 0) {
        onResize();

        heightRef.current = height;
      } else {
        onResize(true);
      }
    }, [width, height, domRef.current]);

    const classNames = useMemo(() => `dv-scroll-ranking-board${className ? ` ${className}` : ""}`, [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        {rows.map((item, i) => (
          <div className="row-item" key={item.toString() + item.scroll} style={{ height: `${heights[i]}px` }}>
            <div className="ranking-info">
              <div className="rank">No.{item.ranking}</div>
              <div className="info-name" dangerouslySetInnerHTML={{ __html: item.name }} />
              <div className="ranking-value">
                {mergedConfig.valueFormatter ? mergedConfig.valueFormatter(item) : item.value + mergedConfig.unit}
              </div>
            </div>

            <div className="ranking-column">
              <div className="inside-column" style={{ width: `${item.percent}%` }}>
                <div className="shine" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

import { useEffect, useState, useRef, useMemo, forwardRef, type CSSProperties, type MutableRefObject } from "react";
import { deepMerge } from "@jiaminghi/charts/lib/util";
import { deepClone } from "@jiaminghi/c-render/lib/plugin/util";

import { type AutoResizeActions, useAutoResize } from "@/hooks";
import { co } from "@/utils";

import "./style.css";

type ScrollBoardConfig = {
  /**
   * @description Board header 表头数据
   * @default header = []
   * @example header = ['column1', 'column2', 'column3']
   */
  header?: string[];
  /**
   * @description Board data 表数据
   * @default data = []
   */
  data?: Array<Array<string | number>>;
  /**
   * @description Row num 表行数
   * @default rowNum = 5
   */
  rowNum?: number;
  /**
   * @description Header background color 表头背景色
   * @default headerBGC = '#00BAFF'
   */
  headerBGC?: string;
  /**
   * @description Odd row background color 奇数行背景色
   * @default oddRowBGC = '#003B51'
   */
  oddRowBGC?: string;
  /**
   * @description Even row background color 偶数行背景色
   * @default evenRowBGC = '#003B51'
   */
  evenRowBGC?: string;
  /**
   * @description Scroll wait time 轮播时间间隔(ms)
   * @default waitTime = 2000
   */
  waitTime?: number;
  /**
   * @description Header height 表头高度
   * @default headerHeight = 35
   */
  headerHeight?: number;
  /**
   * @description Column width 列宽度(可以配置每一列的宽度，默认情况下每一列宽度相等,允许尾部缺省)
   * @default columnWidth = []
   */
  columnWidth?: number[];
  /**
   * @description Column align 列对齐方式(以配置每一列的对齐方式，可选值有'left'|'center'|'right'，默认值为'left',允许尾部缺省)
   * @default align = []
   * @example align = ['left', 'center', 'right']
   */
  align?: Array<"left" | "center" | "right">;
  /**
   * @description Show index 显示行号
   * @default index = false
   */
  index?: boolean;
  /**
   * @description index Header 行号表头
   * @default indexHeader = '#'
   */
  indexHeader?: string;
  /**
   * @description Carousel type 轮播方式
   * @default carousel = 'single'
   */
  carousel?: "single" | "page";
  /**
   * @description Pause scroll when mouse hovered 悬浮暂停轮播
   * @default hoverPause = true
   */
  hoverPause?: boolean;
};

type Handler =
  | undefined
  | ((data: { row: (string | number)[]; ceil: string | number; rowIndex: number; columnIndex: number }) => void);

export interface ScrollBoardProps {
  config?: ScrollBoardConfig;
  onClick?: Handler;
  onMouseOver?: Handler;
  className?: string;
  style?: CSSProperties;
}

const defaultConfig: ScrollBoardConfig = {
  /**
   * @description Board header 表行数
   * @type {Array<String>}
   * @default header = []
   * @example header = ['column1', 'column2', 'column3']
   */
  header: [],
  /**
   * @description Board data
   * @type {Array<Array>}
   * @default data = []
   */
  data: [],
  /**
   * @description Row num
   * @type {Number}
   * @default rowNum = 5
   */
  rowNum: 5,
  /**
   * @description Header background color
   * @type {String}
   * @default headerBGC = '#00BAFF'
   */
  headerBGC: "#00BAFF",
  /**
   * @description Odd row background color
   * @type {String}
   * @default oddRowBGC = '#003B51'
   */
  oddRowBGC: "#003B51",
  /**
   * @description Even row background color
   * @type {String}
   * @default evenRowBGC = '#003B51'
   */
  evenRowBGC: "#0A2732",
  /**
   * @description Scroll wait time
   * @type {Number}
   * @default waitTime = 2000
   */
  waitTime: 2000,
  /**
   * @description Header height
   * @type {Number}
   * @default headerHeight = 35
   */
  headerHeight: 35,
  /**
   * @description Column width
   * @type {Array<Number>}
   * @default columnWidth = []
   */
  columnWidth: [],
  /**
   * @description Column align
   * @type {Array<String>}
   * @default align = []
   * @example align = ['left', 'center', 'right']
   */
  align: [],
  /**
   * @description Show index
   * @type {Boolean}
   * @default index = false
   */
  index: false,
  /**
   * @description index Header
   * @type {String}
   * @default indexHeader = '#'
   */
  indexHeader: "#",
  /**
   * @description Carousel type
   * @type {String}
   * @default carousel = 'single'
   * @example carousel = 'single' | 'page'
   */
  carousel: "single",
  /**
   * @description Pause scroll when mouse hovered
   * @type {Boolean}
   * @default hoverPause = true
   * @example hoverPause = true | false
   */
  hoverPause: true,
};

function calcHeaderData({ header, index, indexHeader }: ScrollBoardConfig) {
  if (!header?.length) {
    return [];
  }

  header = [...header];

  if (index) header.unshift(indexHeader!);

  return header;
}

function calcRows({ data, index, headerBGC, rowNum }: ScrollBoardConfig) {
  if (index) {
    data = data!.map((row, i) => {
      row = [...row];

      const indexTag = `<span class="index" style="background-color: ${headerBGC};">${i + 1}</span>`;

      row.unshift(indexTag);

      return row;
    });
  }

  let dataRows = data!.map((ceils, i) => ({ ceils, rowIndex: i }));

  const rowLength = dataRows.length;

  if (rowLength > rowNum! && rowLength < 2 * rowNum!) {
    dataRows = [...dataRows, ...dataRows];
  }

  return dataRows.map((d, i) => ({ ...d, scroll: i }));
}

function calcAligns(mergedConfig: ScrollBoardConfig, header: string[]) {
  const columnNum = header.length;

  let aligns = new Array(columnNum).fill("left");

  const { align } = mergedConfig;

  return deepMerge(aligns, align);
}

type RowData = { scroll: number; ceils: (string | number)[]; rowIndex: number };

type IState = {
  mergedConfig: ScrollBoardConfig | null;
  header: string[];
  rows: RowData[];
  widths: number[];
  heights: number[];
  aligns: ScrollBoardConfig["align"];
};

/** @description 轮播表  (可以单条轮播也可以整页轮播，支持点击事件，展示数据使用html渲染，因此你可以传递html字符串，定制个性化元素。)*/
export const ScrollBoard = forwardRef<AutoResizeActions, ScrollBoardProps>(
  ({ onClick, config, className, style, onMouseOver }, ref) => {
    const { width, height, domRef } = useAutoResize(ref as MutableRefObject<AutoResizeActions>);

    const [state, setState] = useState<IState>({
      mergedConfig: null,

      header: [],

      rows: [],

      widths: [],

      heights: [],

      aligns: [],
    });

    const { mergedConfig, header, rows, widths, heights, aligns } = state;

    const stateRef = useRef<IState & { rowsData: RowData[]; avgHeight: number; animationIndex: number }>({
      ...state,
      rowsData: [],
      avgHeight: 0,
      animationIndex: 0,
    });

    Object.assign(stateRef.current, state);

    function onResize() {
      if (!mergedConfig) return;

      const widths = calcWidths(mergedConfig, stateRef.current.rowsData);

      const heights = calcHeights(mergedConfig, header);

      const data = { widths, heights };

      Object.assign(stateRef.current, data);
      setState((state) => ({ ...state, ...data }));
    }

    function calcData() {
      const mergedConfig = deepMerge(deepClone(defaultConfig, true), config || {});

      const header = calcHeaderData(mergedConfig);

      const rows = calcRows(mergedConfig);

      const widths = calcWidths(mergedConfig, stateRef.current.rowsData);

      const heights = calcHeights(mergedConfig, header);

      const aligns = calcAligns(mergedConfig, header);

      const data = {
        mergedConfig,
        header,
        rows,
        widths,
        aligns,
        heights,
      };

      Object.assign(stateRef.current, data, {
        rowsData: rows,
        animationIndex: 0,
      });

      setState((state) => ({ ...state, ...data }));
    }

    function calcWidths(
      { columnWidth, header }: Pick<ScrollBoardConfig, "columnWidth" | "header">,
      rowsData: RowData[]
    ) {
      const usedWidth = columnWidth!.reduce((all, w) => all + w, 0);

      let columnNum = 0;
      if (rowsData[0]) {
        columnNum = rowsData[0].ceils.length;
      } else if (header?.length) {
        columnNum = header.length;
      }

      const avgWidth = (width - usedWidth) / (columnNum - columnWidth!.length);

      const widths = new Array(columnNum).fill(avgWidth);

      return deepMerge(widths, columnWidth!);
    }

    function calcHeights(
      { headerHeight, rowNum, data }: Pick<ScrollBoardConfig, "headerHeight" | "rowNum" | "data">,
      header: string[]
    ) {
      let allHeight = height;

      if (header.length) allHeight -= headerHeight!;

      const avgHeight = allHeight / rowNum!;

      Object.assign(stateRef.current, { avgHeight });

      return new Array(data!.length).fill(avgHeight);
    }

    function* animation(start = false) {
      let { avgHeight, animationIndex, mergedConfig, rowsData } = stateRef.current;
      const { waitTime, carousel, rowNum } = mergedConfig || {};
      const rowLength = rowsData.length;

      if (start) yield new Promise((resolve) => setTimeout(resolve, waitTime));

      const animationNum = carousel === "single" ? 1 : rowNum;

      let rows = rowsData.slice(animationIndex);
      rows.push(...rowsData.slice(0, animationIndex));
      rows = rows.slice(0, carousel === "page" ? rowNum! * 2 : rowNum! + 1);

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

    function emitEvent(handle: Handler, ri: number, ci: number, row: RowData, ceil: string | number) {
      const { ceils, rowIndex } = row || {};

      handle && handle({ row: ceils, ceil, rowIndex, columnIndex: ci });
    }

    const task = useRef<{ pause?: () => void; resume?: () => void; end?: () => void }>({});
    function handleHover(enter: boolean, ri?: number, ci?: number, row?: RowData, ceil?: string | number) {
      if (enter) emitEvent(onMouseOver, ri!, ci!, row!, ceil!);

      if (!mergedConfig?.hoverPause) return;

      const { pause, resume } = task.current;

      enter && pause && resume
        ? pause()
        : (function () {
            if (resume) resume();
          })();
    }

    const getBackgroundColor = (rowIndex: number) => mergedConfig?.[rowIndex % 2 === 0 ? "evenRowBGC" : "oddRowBGC"];

    useEffect(() => {
      calcData();

      let start = true;

      function* loop() {
        while (true) {
          // @ts-ignore
          yield* animation(start);

          start = false;

          yield new Promise((resolve) => setTimeout(resolve, stateRef.current?.mergedConfig?.waitTime! - 300));
        }
      }

      const { rows: rowsData } = stateRef.current;
      const rowNum = mergedConfig?.rowNum!;
      const rowLength = rowsData.length;

      if (rowNum >= rowLength) return;

      task.current = co(loop);

      return task.current.end;
    }, [config, domRef.current]);

    useEffect(onResize, [width, height, domRef.current]);

    const classNames = useMemo(() => (className ? `dv-scroll-board ${className}` : "dv-scroll-board"), [className]);

    return (
      <div className={classNames} style={style} ref={domRef}>
        {!!header.length && !!mergedConfig && (
          <div className="header" style={{ backgroundColor: `${mergedConfig.headerBGC}` }}>
            {header.map((headerItem, i) => (
              <div
                className="header-item"
                key={`${headerItem}-${i}`}
                style={{
                  height: `${mergedConfig.headerHeight}px`,
                  lineHeight: `${mergedConfig.headerHeight}px`,
                  width: `${widths[i]}px`,
                  textAlign: aligns?.[i] || "left",
                }}
                // align={aligns[i]}
                dangerouslySetInnerHTML={{ __html: headerItem }}
              />
            ))}
          </div>
        )}

        {!!mergedConfig && (
          <div
            className="rows"
            style={{
              height: `${height - (header?.length ? mergedConfig.headerHeight! : 0)}px`,
            }}
          >
            {rows.map((row, ri) => (
              <div
                className="row-item"
                key={`${row.toString()}-${row.scroll}`}
                style={{
                  height: `${heights[ri]}px`,
                  lineHeight: `${heights[ri]}px`,
                  backgroundColor: `${getBackgroundColor(row.rowIndex)}`,
                }}
              >
                {row.ceils.map((ceil, ci) => (
                  <div
                    className="ceil"
                    key={`${ceil}-${ri}-${ci}`}
                    style={{ width: `${widths[ci]}px`, textAlign: aligns?.[ci] || "left" }}
                    // align={aligns[ci]}
                    dangerouslySetInnerHTML={{ __html: ceil }}
                    onClick={() => emitEvent(onClick, ri, ci, row, ceil)}
                    onMouseEnter={() => handleHover(true, ri, ci, row, ceil)}
                    onMouseLeave={() => handleHover(false)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

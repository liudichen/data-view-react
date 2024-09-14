import type { Point } from "@/types";

export function randomExtend(minNum: number, maxNum: number) {
  if (arguments.length === 1) {
    return parseInt((Math.random() * minNum + 1) as any, 10);
  } else {
    return parseInt((Math.random() * (maxNum - minNum + 1) + minNum) as any, 10);
  }
}

/**
 * @description                       将函数转成防抖动函数
 * @param  {Function}                 需要转成防抖动函数的函数
 * @param  {number}                   延迟时间（毫秒数）
 * @param  {boolean}                  是否执行第一次
 * @return {undefined}                无返回值
 */
export function debounce(fn: Function, delay = 600, runFirstFn = true) {
  let timer: NodeJS.Timeout;

  return function (...rest: any[]) {
    // 清除定时器
    if (timer) clearTimeout(timer);
    if (runFirstFn) {
      fn.apply(this, rest);
      runFirstFn = false;
      return;
    }

    // 设置定时器
    timer = setTimeout(fn.bind(this, ...rest), delay);
  };
}

export function observerDomResize(dom: Node, callback: MutationCallback) {
  const MutationObserver =
    window.MutationObserver || (window as any).WebKitMutationObserver || (window as any).MozMutationObserver;

  const observer = new MutationObserver(callback);

  observer.observe(dom, {
    attributes: true,
    attributeFilter: ["style"],
    attributeOldValue: true,
  });

  return observer;
}

export function getPointDistance(pointOne: Point, pointTwo: Point) {
  const minusX = Math.abs(pointOne[0] - pointTwo[0]);

  const minusY = Math.abs(pointOne[1] - pointTwo[1]);

  return Math.sqrt(minusX * minusX + minusY * minusY);
}

type FunTask = { end?: () => void; pause?: () => void; resume?: () => void };
export function co(gen: any): FunTask {
  let destroyed = false;

  // 处理 return 之后 resume 的问题
  let stop = false;

  let val: any = null;

  if (typeof gen === "function") gen = gen();

  if (!gen || typeof gen.next !== "function") return (() => ({})) as FunTask;

  Promise.resolve().then(() => {
    destroyed || next(gen.next());
  });

  return {
    end() {
      destroyed = true;

      Promise.resolve().then(() => {
        gen.return();

        gen = null;
      });
    },
    pause() {
      if (!destroyed) {
        stop = true;
      }
    },
    resume() {
      const oldVal = val;

      if (!destroyed && stop) {
        stop = false;

        Promise.resolve(val).then(function () {
          if (!destroyed && !stop && oldVal === val) {
            next(gen.next());
          }
        });
      }
    },
  };

  function next(ret: any) {
    if (ret.done) return ret.value;

    val = ret.value;

    return Promise.resolve(ret.value).then(() => {
      !destroyed && !stop && next(gen.next());
    });
  }
}

export function uuid(hasHyphen?: boolean) {
  return (hasHyphen ? "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" : "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx").replace(
    /[xy]/g,
    function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
}

export const getDecorationPoints = (svgWH: [number, number], rowPoints: number, rowNum: number) => {
  const [w, h] = svgWH;

  const horizontalGap = w / (rowPoints + 1);
  const verticalGap = h / (rowNum + 1);

  let points = new Array(rowNum)
    .fill(0)
    .map((foo, i) => new Array(rowPoints).fill(0).map((foo, j) => [horizontalGap * (j + 1), verticalGap * (i + 1)]));

  return points.reduce((all, item) => [...all, ...item], []);
};

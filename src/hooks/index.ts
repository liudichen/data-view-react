import { useState, useCallback, useEffect, useRef, useImperativeHandle, type MutableRefObject } from "react";

import { debounce, observerDomResize } from "@/utils";
import type { SetState } from "@/types";

type Size = { width: number; height: number };

export type AutoResizeActions = {
  setWH: SetState<Size>;
};
export function useAutoResize<T extends HTMLElement = HTMLDivElement>(ref?: MutableRefObject<AutoResizeActions>) {
  const [state, setState] = useState<Size>({ width: 0, height: 0 });

  const domRef = useRef<T>(null);

  const setWH = useCallback(() => {
    const { clientWidth, clientHeight } = domRef.current || { clientWidth: 0, clientHeight: 0 };

    setState({ width: clientWidth, height: clientHeight });

    if (!domRef.current) {
      console.warn("DataV: Failed to get dom node, component rendering may be abnormal!");
    } else if (!clientWidth || !clientHeight) {
      console.warn("DataV: Component width or height is 0px, rendering abnormality may occur!");
    }
  }, []);

  useImperativeHandle(ref, () => ({ setWH }), []);

  useEffect(() => {
    const debounceSetWHFun = debounce(setWH, 100);

    debounceSetWHFun();

    const domObserver = observerDomResize(domRef.current!, debounceSetWHFun);

    window.addEventListener("resize", debounceSetWHFun);

    return () => {
      window.removeEventListener("resize", debounceSetWHFun);

      if (!domObserver) {
        return;
      }

      domObserver.disconnect();
      domObserver.takeRecords();
    };
  }, []);

  return { ...state, domRef, setWH };
}

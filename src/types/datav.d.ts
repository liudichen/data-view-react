declare module "@jiaminghi/charts" {
  export default class Chart {
    constructor(dom?: Node);
    container: Node;
    canvas: HTMLCanvasElement;
    render: any;
    option?: ChartOptions;
    resize: () => void;
    setOption: (option: ChartOptions, animationEnd?: boolean) => void;
  }
}

declare module "@jiaminghi/charts/lib/util" {
  export function deepMerge<T extends object>(target: Partial<T>, toMerged?: Partial<T>): T;
  export function getPolylineLength(points: [number, number][]): number;
}

declare module "@jiaminghi/c-render/lib/plugin/util" {
  export function deepClone<T extends object = any>(obj: T, recursion?: boolean): T;

  export function getCircleRadianPoint(x: number, y: number, r: number, startAngle: number): [number, number];
}

declare module "@jiaminghi/color" {
  export function fade(color: string, opacity: number): string;
}

declare module "@jiaminghi/c-render" {
  type HoverRect = [number, number, number, number];
  type Point = [number, number];
  type CanvasCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  type EaseCurve =
    | "linear"
    | "easeInSine"
    | "easeOutSine"
    | "easeInOutSine"
    | "easeInQuad"
    | "easeOutQuad"
    | "easeInOutQuad"
    | "easeInCubic"
    | "easeOutCubic"
    | "easeInOutCubic"
    | "easeInQuart"
    | "easeOutQuart"
    | "easeInOutQuart"
    | "easeInQuint"
    | "easeOutQuint"
    | "easeInOutQuint"
    | "easeInBack"
    | "easeOutBack"
    | "easeInOutBack"
    | "easeInElastic"
    | "easeOutElastic"
    | "easeInOutElastic"
    | "easeInBounce"
    | "easeOutBounce"
    | "easeInOutBounce";

  enum Status {
    STATIC = "STATIC",
    HOVER = "HOVER",
    ACTIVE = "ACTIVE",
    DRAG = "DRAG",
  }
  type AnimationKey = "shape" | "style";

  type AnimationFrameStateItem<Shape> = Partial<Shape> | StyleConfig<RgbaValue>;

  type StyleConfig<ColorType = CRenderColor> = {
    /**
     * @description Rgba value of graph fill color
     */
    fill?: ColorType;
    /**
     * @description Rgba value of graph stroke color
     */
    stroke?: ColorType;
    /**
     * @description Opacity of graph
     */
    opacity?: number;
    /**
     * @description LineCap of Ctx
     */
    lineCap?: LineCap;
    /**
     * @description Linejoin of Ctx
     */
    lineJoin?: LineJoin;
    /**
     * @description LineDash of Ctx
     */
    lineDash?: number[];
    /**
     * @description LineDashOffset of Ctx
     */
    lineDashOffset?: number;
    /**
     * @description ShadowBlur of Ctx
     */
    shadowBlur?: number;
    /**
     * @description Rgba value of graph shadow color
     */
    shadowColor?: ColorType;
    /**
     * @description ShadowOffsetX of Ctx
     */
    shadowOffsetX?: number;
    /**
     * @description ShadowOffsetY of Ctx
     */
    shadowOffsetY?: number;
    /**
     * @description LineWidth of Ctx
     */
    lineWidth?: number;
    /**
     * @description Center point of the graph
     */
    graphCenter?: [number, number];
    /**
     * @description Graph scale
     */
    scale?: [number, number];
    /**
     * @description Graph rotation degree
     */
    rotate?: number;
    /**
     * @description Graph translate distance
     */
    translate?: [number, number];
    /**
     * @description Cursor status when hover
     */
    hoverCursor?: HoverCursor;
    /**
     * @description Font style of Ctx
     */
    fontStyle?: FontStyle;
    /**
     * @description Font varient of Ctx
     */
    fontVarient?: FontVarient;
    /**
     * @description Font weight of Ctx
     */
    fontWeight?: FontWeight;
    /**
     * @description Font size of Ctx
     */
    fontSize?: number;
    /**
     * @description Font family of Ctx
     */
    fontFamily?: string;
    /**
     * @description TextAlign of Ctx
     */
    textAlign?: TextAlign;
    /**
     * @description TextBaseline of Ctx
     */
    textBaseline?: TextBaseLine;
    /**
     * @description The color used to create the gradient
     */
    gradientColor?: ColorType[];
    /**
     * @description Gradient type
     */
    gradientType?: GradientType;
    /**
     * @description Gradient params
     */
    gradientParams?: GradientParams;
    /**
     * @description When to use gradients
     */
    gradientWith?: GradientWith;
    /**
     * @description Gradient color stops
     */
    gradientStops?: GradientStops;
  };

  type AnimationQueueItem<Shape = any> = {
    key: AnimationKey;
    frameState: AnimationFrameStateItem<Shape>[];
  };

  type GraphConfig<Shape = any> = {
    /**
     * @description Graph shape
     */
    shape: Shape;
    /**
     * @description Graph style
     */
    style?: StyleConfig<string | RgbaValue>;
    /**
     * @description Weather to render graph
     */
    visible?: boolean;
    /**
     * @description Whether to enable drag
     */
    drag?: boolean;
    /**
     * @description Whether to enable hover
     */
    hover?: boolean;
    /**
     * @description Graph rendering index
     *  Give priority to index high graph in rendering
     */
    index?: number;
    /**
     * @description Animation delay time(ms)
     */
    animationDelay?: number;
    /**
     * @description Number of animation frames
     */
    animationFrame?: number;
    /**
     * @description Animation dynamic curve (Supported by transition)
     * @link https://github.com/jiaming743/Transition
     */
    animationCurve?: EaseCurve;
    /**
     * @description Weather to pause graph animation
     */
    animationPause?: boolean;
    /**
     * @description Rectangular hover detection zone
     *  Use this method for hover detection first
     * @example hoverRect = [0, 0, 100, 100] // [Rect start x, y, Rect width, height]
     */
    hoverRect?: HoverRect;
    /**
     * @description Mouse enter event handler
     */
    onMouseEnter?: () => void;
    /**
     * @description Mouse outer event handler
     */
    onMouseOuter?: () => void;
    /**
     * @description Mouse click event handler
     */
    onClick?: () => void;
    /**
     * @description Funciton of draw graph
     */
    draw?: () => void;
    /**
     * @description Function of set Graph center
     */
    setGraphCenter?: (e?: MouseEvent) => void;
    /**
     * @description Funciton of check graph is hovered
     */
    hoverCheck?: (point: Point) => boolean;
    /**
     * @description Function of Graph move
     */
    move?: (e: MouseEvent) => void;
    /**
     * @description Life cycle beforeAdd
     */
    // eslint-disable-next-line
    beforeAdd?: (graph: Graph) => any;
    /**
     * @description Life cycle added
     */
    // eslint-disable-next-line
    added?: (graph: Graph) => any;
    /**
     * Life Cycle when graph before draw
     */
    // eslint-disable-next-line
    beforeDraw?: (graph: Graph) => any;
    /**
     * Life Cycle when graph drawed
     */
    // eslint-disable-next-line
    drawed?: (graph: Graph) => any;
    /**
     * Life Cycle when graph before move
     */
    // eslint-disable-next-line
    beforeMove?: (e: MouseEvent, graph: Graph) => any;
    /**
     * @description Life Cycle when graph moved
     */
    // eslint-disable-next-line
    moved?: (e: MouseEvent, graph: Graph) => any;
    /**
     * @description Life Cycle when graph before delete
     */
    // eslint-disable-next-line
    beforeDelete?: (graph: Graph) => any;
    /**
     * @description Life Cycle when graph deleted
     */
    // eslint-disable-next-line
    deleted?: (graph: Graph) => any;
  };

  export class Graph<Shape = any> {
    /**
     * @description Graph Name
     */
    name!: string;
    /**
     * @description Graph Render
     */
    render!: CRender;
    /**
     * @description Graph shape
     */
    shape!: Shape;
    /**
     * @description Graph style
     */
    style!: Style;
    /**
     * @description Weather to render graph
     * @default visible = true
     */
    visible: boolean;
    /**
     * @description Whether to enable drag
     */
    drag: boolean;
    /**
     * @description Whether to enable hover
     * @default hover = false
     */
    hover: boolean;
    /**
     * @description Graph rendering index
     *  Give priority to index high graph in rendering
     * @default index = 1
     */
    index: number;
    /**
     * @description Animation delay time(ms)
     * @default animationDelay = 0
     */
    animationDelay: number;
    /**
     * @description Number of animation frames
     * @default animationFrame = 30
     */
    animationFrame: number;
    /**
     * @description Animation dynamic curve (Supported by transition)
     * @link https://github.com/jiaming743/Transition
     * @default animationCurve = "linear"
     */
    animationCurve: EaseCurve = "linear";
    /**
     * @description Weather to pause graph animation
     * @default pauseAnimation = false
     */
    animationPause: boolean;
    /**
     * @description Rectangular hover detection zone
     *  Use this method for hover detection first
     * @example hoverRect = [0, 0, 100, 100] // [Rect start x, y, Rect width, height]
     */
    hoverRect?: HoverRect;
    /**
     * @description Mouse enter event handler
     */
    // eslint-disable-next-line
    onMouseEnter?: (e: MouseEvent) => any;
    /**
     * @description Mouse outer event handler
     */
    // eslint-disable-next-line
    onMouseOuter?: (e: MouseEvent) => any;
    /**
     * @description Mouse click event handler
     */
    // eslint-disable-next-line
    onClick?: (e: MouseEvent) => any;
    /**
     * @description Graph current status
     */
    status: Status = Status.STATIC;
    /**
     * @description Graph animation frame state
     */
    animationQueue: AnimationQueueItem<Shape>[] = [];
    /**
     * @description Funciton of draw graph
     */
    // eslint-disable-next-line
    draw(): void {}
    /**
     * @description Function of set Graph center
     */
    // eslint-disable-next-line
    setGraphCenter(_e?: MouseEvent): void;
    /**
     * @description Funciton of check graph is hovered
     */
    hoverCheck(_point: Point): boolean;
    /**
     * @description Function of Graph move
     */
    // eslint-disable-next-line
    move(_e: MouseEvent): void;
    /**
     * @LifeCyle
     * @description Life Cycle hooks, will all be called in render
     */
    /**
     * @description Life Cycle when graph before add
     */
    // eslint-disable-next-line
    beforeAdd?: (graph: Graph) => any;
    /**
     * @description Life Cycle when graph added
     */
    // eslint-disable-next-line
    added?: (graph: Graph) => any;
    /**
     * @description Life Cycle when graph before draw
     */
    // eslint-disable-next-line
    beforeDraw?: (graph: Graph) => any;
    /**
     * @description Life Cycle when graph drawed
     */
    // eslint-disable-next-line
    drawed?: (graph: Graph, _this: CRender) => any;
    /**
     * @description Life Cycle when graph before move
     */
    // eslint-disable-next-line
    beforeMove?: (e: MouseEvent, graph: Graph) => any;
    /**
     * @description Life Cycle when graph moved
     */
    // eslint-disable-next-line
    moved?: (e: MouseEvent, graph: Graph) => any;
    /**
     * @description Life Cycle when graph before delete
     */
    // eslint-disable-next-line
    beforeDelete?: (graph: Graph) => any;
    /**
     * @description Life Cycle when graph deleted
     */
    // eslint-disable-next-line
    deleted?: (graph: Graph) => any;

    constructor(config: GraphConfig<Shape>);

    static mergeDefaultShape<Shape>(
      defaultShape: Shape,
      config: GraphConfig<Partial<Shape>>,
      checker?: (config: GraphConfig<Shape>) => void
    ): GraphConfig<Shape>;

    private checkRender(): void;
    /**
     * @description Update graph attribute
     */
    attr(key: keyof GraphConfig<Shape>, value: Partial<GraphConfig<Shape>[typeof key]>, reDraw: boolean = true): void;

    /**
     * @description Update graphics state (with animation)
     * Only shape and style attributes are supported
     */
    async animation(key: "shape", value: Partial<Shape>, wait?: boolean): Promise<void>;
    async animation(key: "style", value: StyleConfig<string | RgbaValue>, wait?: boolean): Promise<void>;
    async animation(
      key: AnimationKey,
      value: Partial<Shape> | StyleConfig<string | RgbaValue>,
      wait: boolean = false
    ): Promise<void>;

    /**
     * @description Skip to the last frame of animation
     */
    animationEnd(): void;

    /**
     * @description Pause animation behavior
     */
    pauseAnimation(): void;

    /**
     * @description Try animate
     */
    playAnimation(): Promise<void>;

    clone(add: boolean = true): Graph<Shape>;
  }

  export class CRender {
    /**
     * @description Device Pixel Ratio
     */
    readonly dpr: number;
    /**
     * @description Off Screen Rendering
     */
    readonly offScreenRendering: boolean;
    /**
     * @description Canvas Element
     */
    readonly canvas!: HTMLCanvasElement;
    /**
     * @description Off Screen Canvas Element
     */
    private readonly osCanvas?: OffscreenCanvas;
    /**
     * @description Ctx for current rendering
     */
    public ctx!: CanvasCtx;
    /**
     * @description Actual Canvas Context
     */
    private readonly actualCtx!: CanvasRenderingContext2D;
    /**
     * @description Off Screen Canvas Context
     */
    private readonly osCtx?: OffscreenCanvasRenderingContext2D;
    /**
     * @description Width and height of the canvas
     */
    readonly area: [number, number] = [0, 0];
    /**
     * @description Whether render is in animation rendering
     */
    animationStatus: boolean = false;
    /**
     * @description Added graph
     */
    readonly graphs: Graph[] = [];
    constructor(canvas: HTMLCanvasElement, offScreenRendering?: boolean);

    clearArea(): void;

    /**
     * @description Sort the graphs by index
     * Give priority to index high graph in rendering
     */
    sortGraphsByIndex(): void;

    drawAllGraph(immediately?: boolean): void;

    private drawAllGraphDebounced(): void;

    private drawAllGraphImmediately(): void;

    private drawGraphProcessor(graph: Graph): void;

    add(graph: Graph | Graph[], wait?: boolean): void;

    private graphAddProcessor(graph: Graph): void;

    delGraph(graph: Graph | Graph[], wait?: boolean): void;

    private graphDelProcessor(graph: Graph): void;

    delAllGraph(): void;
    /**
     * @description Animate the graph whose animation queue is not empty
     * and the animationPause is false
     */

    launchAnimation(): void | Promise<void>;

    private animate(callback: () => void, timeStamp: number): void;

    /**
     * @description Extract the next frame of data from the animation queue
     * and update the graph state
     * @param timeStamp {number} Animation start timestamp
     */
    private graphTrunNextAnimationFrame(graph: Graph, timeStamp: number): void;

    animateAble(): boolean;

    /**
     * @description Handler of CRender mousedown event
     */
    private mouseDown(): void;

    /**
     * @description Handler of CRender mousemove event
     */
    private mouseMove(e: MouseEvent): void;

    private graphMoveProcessor(graph: Graph, e: MouseEvent): void;

    private graphHoverCheckProcessor(graph: Graph, point: Point): boolean;

    /**
     * @description Handler of CRender mouseup event
     */
    private mouseUp(e: MouseEvent): void;
  }
}

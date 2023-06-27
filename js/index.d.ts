declare module '@packaged-ui/pagelets' {

  export type Events = {
    PREPARE: 'prepare',
    PROGRESS: 'progress',
    REQUESTED: 'requested',
    RETRIEVED: 'retrieved',
    RENDERED: 'rendered',
    COMPLETE: 'complete',
    CANCELLED: 'cancelled',
    ERROR: 'error',
  }

  type PageletStates = {
    NONE: '',
    REQUESTED: 'requested',
    LOADING: 'loading',
    LOADED: 'loaded',
    REFRESHING: 'refreshing',
    ERROR: 'error',
  }

  export interface PageletEvent extends CustomEvent {
    detail: RequestProperties extends object ? RequestProperties : object
    bubbles: boolean,
    cancelable: boolean,
    composed: boolean,
  }

  interface RequestProperties {
    url: string;
    ActionIterator: ActionIterator;
    sourceElement: Element;
    targetElement: Element | string;
    pushUrl: string;
    headers: object;
    data: object;
    method: string;
    withCredentials: boolean;
  }

  interface ResponseProperties {
    status: number;
    statusText: string;
    headers: object;
    actions: [];
  }

  export class ActionIterator {
    constructor();

    iterate(actions: [], request: RequestProperties, response: ResponseProperties, options: object): Promise<void>;
  }

  export class PageletRequest extends EventTarget {
    constructor(properties: RequestProperties);

    addProcessor(processor: ActionProcessor): void;

    get getResolvedTarget(): Element | null;

    get getRequestedTarget(): string | null;

    getRequestMethod(): string;

    get getPushUrl(): string | null;

    triggerEvent(eventType: string, data: object, cancelable: boolean): boolean;

    fromElement(element: Element): PageletRequest;
  }

  export class PageletResponse {
    constructor(properties: ResponseProperties)
  }

  export class ActionProcessor {
    get action(): string;

    process(action: any, request: PageletRequest, response: PageletResponse, options: any): any
  }

  export interface InitOptions {
    selector?: string;
    formSelector?: string;
    defaultTarget?: string;
    allowPersistentTargets?: boolean;
    listenElement?: string;
    minRefreshRate?: number;
    iterator?: ActionIterator;
    composedEvents?: boolean;
  }

  export class Pagelets {
    static init(options?: InitOptions): void;

    static events: Events;

    static addProcessor(processor: ActionProcessor): void;

    static refresh(element: Element): void;

    static load(request: RequestProperties | object): Promise<{
      request: RequestProperties,
      response: ResponseProperties
    }>

    static Request: PageletRequest;
  }
}

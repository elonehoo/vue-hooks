import { Ref, ref, isRef, onMounted } from "vue"
import {RemoveEventFunction, useMouse} from './mouse'
import {RefTyped, RefElement,wrap, isClient,NO_OP,isNumber,PASSIVE_EV} from '../utils'
import {useDebounce} from '../debounce'

export interface ResizeResult {
  height: Ref<number>;
  width: Ref<number>;
  remove: RemoveEventFunction;
}

export function useResize(el: RefTyped<Window>, wait: number): ResizeResult

export function useResize(
  el: RefTyped<Window>,
  options?: boolean | AddEventListenerOptions,
  wait?: number
): ResizeResult

export function useResize(el: RefElement, wait: number): ResizeResult;
export function useResize(
  el: RefElement,
  options?: boolean | AddEventListenerOptions,
  wait?: number
): ResizeResult;

export function useResize<T extends Element>(
  el: Ref<T> | Ref<T | null>,
  options?: boolean | AddEventListenerOptions,
  wait?: number
): ResizeResult;

export function useResize<T extends Element>(
  el: Ref<T | null>,
  wait: number
): ResizeResult;

export function useResize(
  el: any,
  options?: number | boolean | AddEventListenerOptions,
  wait?: number
): ResizeResult {
  const element = wrap(el);

  const height = ref(element.value && element.value.clientHeight);
  const width = ref(element.value && element.value.clientWidth);

  let handler = () => {
    height.value = element.value.clientHeight;
    width.value = element.value.clientWidth;
  };

  const [eventOptions, ms] = isNumber(options)
    ? [undefined, options]
    : [options, wait];

  if (ms) {
    handler = useDebounce(handler, wait);
  }

  // resize seems only to be fired against the window
  const remove = isClient
    ? useMouse(window, "resize", handler, eventOptions || PASSIVE_EV)
    : /* istanbul ignore next */ NO_OP;

  if (isRef(el) && !el.value) {
    onMounted(handler);
  }

  return {
    height,
    width,

    remove
  };
}


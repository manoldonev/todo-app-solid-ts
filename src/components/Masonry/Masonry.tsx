import type { ParentComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { onMount, onCleanup } from 'solid-js';
import Masonry from 'masonry-layout';
import { createMutationObserver } from '@solid-primitives/mutation-observer';

interface MasonryProps {
  options?: Masonry.Options;
  elementType?: string;
  class?: string;
}

const MasonryComponent: ParentComponent<MasonryProps> = (props) => {
  let masonry: Masonry;
  let containerRef: HTMLElement;

  const diffDomChildren = (
    records: MutationRecord[],
  ): {
    prepended: Element[];
    appended: Element[];
    removed: Element[];
    shouldReloadItems: boolean;
  } => {
    let shouldReloadItems = false;

    // we know the generic NodeList actually contains Element nodes as we are using the "childList" strategy for the DOM mutation observer
    const prepended: Element[] = [];
    const appended: Element[] = [];
    const removed: Element[] = [];
    records.forEach((record) => {
      // NOTE: we assume nodes are either prepended, or appended -- no inserts
      if (record.addedNodes.length > 0) {
        if (record.previousSibling != null) {
          appended.push(...([...record.addedNodes] as Element[]));
        } else if (record.nextSibling != null) {
          prepended.push(...([...record.addedNodes] as Element[]));
        } else {
          throw new Error(`Adding nodes without previous or next sibling is not supported.`);
        }
      } else if (record.removedNodes.length > 0) {
        removed.push(...([...record.removedNodes] as Element[]));

        // force items reload to notify Masonry of removed items if removing any other item(s) but the last one(s)
        if (record.nextSibling != null) {
          shouldReloadItems = true;
        }
      }

      return true;
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    shouldReloadItems = shouldReloadItems || prepended.length > 0;

    return {
      prepended,
      appended,
      removed,
      shouldReloadItems,
    };
  };

  const performLayout = (records: MutationRecord[]): void => {
    const { prepended, appended, removed, shouldReloadItems } = diffDomChildren(records);

    if (shouldReloadItems) {
      masonry.reloadItems?.();
      masonry.layout?.();
      return;
    }

    if (prepended.length > 0) {
      masonry.prepended?.(prepended);
    }

    if (appended.length > 0) {
      masonry.appended?.(appended);
    }

    if (removed.length > 0) {
      masonry.remove?.(removed);
    }

    masonry.layout?.();
  };

  onMount(() => {
    masonry = new Masonry(containerRef, props.options);
  });

  onCleanup(() => {
    masonry.destroy?.();
  });

  createMutationObserver(
    () => containerRef,
    { childList: true },
    (records) => performLayout(records),
  );

  return (
    <Dynamic component={props.elementType ?? 'div'} class={props.class} ref={containerRef!}>
      {props.children}
    </Dynamic>
  );
};

export { MasonryComponent as Masonry };

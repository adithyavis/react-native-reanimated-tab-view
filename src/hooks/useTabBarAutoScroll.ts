import type { FlatList } from 'react-native-gesture-handler';
import type { Layout } from '../types/common';
import { useCallback, type RefObject } from 'react';
import { useStateUpdatesListener } from './useStateUpdatesListener';
import { useTabLayoutContext } from '../providers/TabLayout';

type AutoScrollToRouteIndexParams = {
  shouldScrollToIndex: boolean;
  animated: boolean;
};

export const useTabBarAutoScroll = (
  flatListRef: RefObject<FlatList>,
  currentRouteIndex: number,
  layout: Layout
) => {
  const { routeIndexToTabWidthMap, routeIndexToTabOffsetMap } =
    useTabLayoutContext();

  const autoScrollToRouteIndex = useCallback(
    (routeIndex: number, params?: Partial<AutoScrollToRouteIndexParams>) => {
      const { animated, shouldScrollToIndex } = {
        animated: true,
        shouldScrollToIndex: false,
        ...params,
      };
      if (shouldScrollToIndex) {
        const width = routeIndexToTabWidthMap.value[routeIndex] ?? 0;
        const viewOffset = layout.width / 2 - width / 2;
        flatListRef.current?.scrollToIndex({
          index: routeIndex,
          viewOffset,
          animated,
        });
      } else {
        let offset = routeIndexToTabOffsetMap.value[routeIndex] ?? 0;
        const width = routeIndexToTabWidthMap.value[routeIndex] ?? 0;
        offset -= layout.width / 2 - width / 2;
        flatListRef.current?.scrollToOffset({
          offset,
          animated,
        });
      }
    },
    [
      flatListRef,
      layout.width,
      routeIndexToTabOffsetMap.value,
      routeIndexToTabWidthMap.value,
    ]
  );

  useStateUpdatesListener(
    currentRouteIndex,
    useCallback(() => {
      setTimeout(() => {
        autoScrollToRouteIndex(currentRouteIndex);
      }, 500);
    }, [autoScrollToRouteIndex, currentRouteIndex])
  );

  const handleScrollToIndexFailed = useCallback(
    ({ index: routeIndex }: { index: number }) => {
      let offset = routeIndexToTabOffsetMap.value[routeIndex] ?? 0;
      const width = routeIndexToTabWidthMap.value[routeIndex] ?? 0;
      offset -= layout.width / 2 + width / 2;
      flatListRef.current?.scrollToOffset({
        offset,
      });
    },
    [
      flatListRef,
      layout.width,
      routeIndexToTabOffsetMap,
      routeIndexToTabWidthMap,
    ]
  );

  return { autoScrollToRouteIndex, handleScrollToIndexFailed };
};

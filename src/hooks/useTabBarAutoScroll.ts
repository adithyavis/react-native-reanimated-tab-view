import type { FlatList } from 'react-native-gesture-handler';
import type { Layout } from '../types/common';
import { useCallback, type RefObject } from 'react';
import { useStateUpdatesListener } from './useStateUpdatesListener';
import { useTabLayoutContext } from '../providers/TabLayout';

export const useTabBarAutoScroll = (
  flatListRef: RefObject<FlatList>,
  routeIndex: number,
  layout: Layout
) => {
  const { routeIndexToTabWidthMap, routeIndexToTabOffsetMap } =
    useTabLayoutContext();

  const autoScrollToRouteIndex = useCallback(
    (index: number) => {
      const width = routeIndexToTabWidthMap.value[index] ?? 0;
      const viewOffset = layout.width / 2 - width / 2;
      flatListRef.current?.scrollToIndex({ index, viewOffset });
    },
    [flatListRef, layout.width, routeIndexToTabWidthMap]
  );

  useStateUpdatesListener(
    routeIndex,
    useCallback(() => {
      autoScrollToRouteIndex(routeIndex);
    }, [autoScrollToRouteIndex, routeIndex])
  );

  const handleScrollToIndexFailed = useCallback(
    ({ index }: { index: number }) => {
      let offset = routeIndexToTabOffsetMap.value[index] ?? 0;
      const width = routeIndexToTabWidthMap.value[index] ?? 0;
      offset -= layout.width / 2 - width / 2;
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

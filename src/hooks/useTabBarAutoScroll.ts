import type { FlatList } from 'react-native-gesture-handler';
import type { Layout, NavigationState } from '../types/common';
import { useCallback, type MutableRefObject, type RefObject } from 'react';
import { useStateUpdatesListener } from './useStateUpdatesListener';
import type {
  RouteIndexToTabOffsetMap,
  RouteIndexToTabWidthMap,
} from '../types/TabBar';

export const useTabBarAutoScroll = (
  flatListRef: RefObject<FlatList>,
  navigationState: NavigationState,
  routeIndexToTabWidthMapRef: MutableRefObject<RouteIndexToTabWidthMap>,
  routeIndexToTabOffsetMap: RouteIndexToTabOffsetMap,
  layout: Layout
) => {
  const autoScrollToRouteIndex = useCallback(
    (index: number) => {
      const width = routeIndexToTabWidthMapRef.current[index] ?? 0;
      const viewOffset = layout.width / 2 - width / 2;
      flatListRef.current?.scrollToIndex({ index, viewOffset });
    },
    [flatListRef, layout.width, routeIndexToTabWidthMapRef]
  );

  useStateUpdatesListener(
    navigationState.index,
    useCallback(() => {
      autoScrollToRouteIndex(navigationState.index);
    }, [autoScrollToRouteIndex, navigationState.index])
  );

  const handleScrollToIndexFailed = useCallback(
    ({ index }: { index: number }) => {
      let offset = routeIndexToTabOffsetMap[index] ?? 0;
      const width = routeIndexToTabWidthMapRef.current[index] ?? 0;
      offset -= layout.width / 2 - width / 2;
      flatListRef.current?.scrollToOffset({
        offset,
      });
    },
    [
      flatListRef,
      layout.width,
      routeIndexToTabOffsetMap,
      routeIndexToTabWidthMapRef,
    ]
  );

  return { autoScrollToRouteIndex, handleScrollToIndexFailed };
};

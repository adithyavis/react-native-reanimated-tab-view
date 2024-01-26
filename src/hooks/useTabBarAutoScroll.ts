import type { FlatList } from 'react-native-gesture-handler';
import type { Layout, NavigationState } from '../types/common';
import { useCallback, type MutableRefObject, type RefObject } from 'react';
import { useStateUpdatesListener } from './useStateUpdatesListener';
import type { RouteIndexToTabWidthMap } from '../types/TabBar';

export const useTabBarAutoScroll = (
  flatListRef: RefObject<FlatList>,
  navigationState: NavigationState,
  routeIndexToTabWidthMapRef: MutableRefObject<RouteIndexToTabWidthMap>,
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
      let offset = 0;
      for (let i = 0; i < index; i += 1) {
        offset += routeIndexToTabWidthMapRef.current[i] ?? 0;
      }
      const width = routeIndexToTabWidthMapRef.current[index] ?? 0;
      offset -= layout.width / 2 - width / 2;
      flatListRef.current?.scrollToOffset({
        offset,
      });
    },
    [flatListRef, layout.width, routeIndexToTabWidthMapRef]
  );

  return { autoScrollToRouteIndex, handleScrollToIndexFailed };
};

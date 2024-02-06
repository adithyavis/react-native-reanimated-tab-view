import { useCallback } from 'react';
import { useTabLayoutContext } from '../providers/TabLayout';
import { runOnUI } from 'react-native-reanimated';
import type { LayoutChangeEvent } from 'react-native';

export const useHandleTabLayout = (index: number, noOfRoutes: number) => {
  const { routeIndexToTabWidthMap, routeIndexToTabOffsetMap } =
    useTabLayoutContext();

  const handleTabLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      function updateTabWidthAndOffset() {
        'worklet';

        const { width } = nativeEvent.layout;
        const prevWidth = routeIndexToTabWidthMap.value[index] ?? 0;
        if (width !== prevWidth) {
          routeIndexToTabWidthMap.value = {
            ...routeIndexToTabWidthMap.value,
            [index]: width,
          };
          let prevRouteIndexOffset = 0;
          for (let i = 0; i <= noOfRoutes; i += 1) {
            const prevRouteIndexWidth =
              routeIndexToTabWidthMap.value[i - 1] ?? 0;
            const currentRouteIndexOffset =
              prevRouteIndexOffset + prevRouteIndexWidth;
            routeIndexToTabOffsetMap.value = {
              ...routeIndexToTabOffsetMap.value,
              [i]: currentRouteIndexOffset,
            };
            prevRouteIndexOffset = currentRouteIndexOffset;
          }
        }
      }
      runOnUI(updateTabWidthAndOffset)();
    },
    [routeIndexToTabWidthMap, index, noOfRoutes, routeIndexToTabOffsetMap]
  );
  return { handleTabLayout };
};

export const useHandleTabBarItemLayout = (index: number) => {
  const { routeIndexToTabBarItemWidthMap } = useTabLayoutContext();

  const handleTabBarItemLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      function updateTabBarItemWidthAndOffset() {
        'worklet';

        const { width } = nativeEvent.layout;
        const prevWidth = routeIndexToTabBarItemWidthMap.value[index] ?? 0;
        if (width !== prevWidth) {
          routeIndexToTabBarItemWidthMap.value = {
            ...routeIndexToTabBarItemWidthMap.value,
            [index]: width,
          };
        }
      }
      runOnUI(updateTabBarItemWidthAndOffset)();
    },
    [index, routeIndexToTabBarItemWidthMap]
  );
  return { handleTabBarItemLayout };
};

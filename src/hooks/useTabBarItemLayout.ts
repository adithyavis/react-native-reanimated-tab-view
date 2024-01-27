import { useCallback, type MutableRefObject } from 'react';
import type {
  RouteIndexToTabOffsetMap,
  RouteIndexToTabWidthMap,
} from '../types/TabBar';
import type { LayoutRectangle } from 'react-native';

export const useHandleTabBarItemLayout = (
  routeIndexToTabWidthMapRef: MutableRefObject<RouteIndexToTabWidthMap>,
  setRouteIndexToTabOffsetMap: React.Dispatch<
    React.SetStateAction<RouteIndexToTabOffsetMap>
  >,
  noOfRoutes: number
) => {
  const handleTabBarItemLayout = useCallback(
    (index: number, nativeEventLayout: LayoutRectangle) => {
      const { width } = nativeEventLayout;
      const prevWidth = routeIndexToTabWidthMapRef.current[index] ?? 0;
      if (width !== prevWidth) {
        routeIndexToTabWidthMapRef.current = {
          ...routeIndexToTabWidthMapRef.current,
          [index]: width,
        };
        let prevRouteIndexOffset = 0;
        for (let i = 0; i <= noOfRoutes; i += 1) {
          const prevRouteIndexWidth =
            routeIndexToTabWidthMapRef.current[i - 1] ?? 0;
          const currentRouteIndexOffset =
            prevRouteIndexOffset + prevRouteIndexWidth;
          setRouteIndexToTabOffsetMap((prevRouteIndexToTabOffsetMap) => ({
            ...prevRouteIndexToTabOffsetMap,
            [i]: currentRouteIndexOffset,
          }));
          prevRouteIndexOffset = currentRouteIndexOffset;
        }
      }
    },
    [noOfRoutes, routeIndexToTabWidthMapRef, setRouteIndexToTabOffsetMap]
  );
  return { handleTabBarItemLayout };
};

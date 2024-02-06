import React, { createContext, useContext } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import type {
  RouteIndexToTabBarItemWidthMap,
  RouteIndexToTabOffsetMap,
  RouteIndexToTabWidthMap,
} from '../types/TabBar';

type TabLayoutContext = {
  routeIndexToTabWidthMap: SharedValue<RouteIndexToTabWidthMap>;
  routeIndexToTabOffsetMap: SharedValue<RouteIndexToTabOffsetMap>;
  routeIndexToTabBarItemWidthMap: SharedValue<RouteIndexToTabBarItemWidthMap>;
};

const TabLayoutContext = createContext<TabLayoutContext>({
  routeIndexToTabWidthMap: { value: {} },
  routeIndexToTabOffsetMap: { value: {} },
  routeIndexToTabBarItemWidthMap: { value: {} },
});

export const TabLayoutContextProvider: React.FC = React.memo(
  function TabLayoutContextProvider({ children }) {
    const routeIndexToTabWidthMap = useSharedValue({});
    const routeIndexToTabOffsetMap = useSharedValue({});
    const routeIndexToTabBarItemWidthMap = useSharedValue({});

    return (
      <TabLayoutContext.Provider
        value={{
          routeIndexToTabWidthMap,
          routeIndexToTabOffsetMap,
          routeIndexToTabBarItemWidthMap,
        }}
      >
        {children}
      </TabLayoutContext.Provider>
    );
  }
);

export const useTabLayoutContext = () => useContext(TabLayoutContext);

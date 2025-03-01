import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { TabIndicatorProps } from '../types/TabIndicator';
import { useTabLayoutContext } from '../providers/TabLayout';

const TabIndicator = React.memo((props: TabIndicatorProps) => {
  const { tabBarType, animatedRouteIndex, style } = props;

  const {
    routeIndexToTabWidthMap,
    routeIndexToTabOffsetMap,
    routeIndexToTabBarItemWidthMap,
  } = useTabLayoutContext();

  const animatedTabIndicatorStyle = useAnimatedStyle(() => {
    const animatedRouteIndexFloor = Math.floor(animatedRouteIndex.value);
    const animatedRouteIndexCeil = animatedRouteIndexFloor + 1;

    const translateXFloor =
      tabBarType === 'primary'
        ? (routeIndexToTabOffsetMap.value[animatedRouteIndexFloor] ?? 0) +
          (routeIndexToTabWidthMap.value[animatedRouteIndexFloor] ?? 0) / 2 -
          (routeIndexToTabBarItemWidthMap.value[animatedRouteIndexFloor] ?? 0) /
            2
        : routeIndexToTabOffsetMap.value[animatedRouteIndexFloor] ?? 0;
    const translateXCeil =
      tabBarType === 'primary'
        ? (routeIndexToTabOffsetMap.value[animatedRouteIndexCeil] ?? 0) +
          (routeIndexToTabWidthMap.value[animatedRouteIndexCeil] ?? 0) / 2 -
          (routeIndexToTabBarItemWidthMap.value[animatedRouteIndexCeil] ?? 0) /
            2
        : routeIndexToTabOffsetMap.value[animatedRouteIndexCeil] ?? 0;
    const translateX =
      translateXFloor *
        (1 - (animatedRouteIndex.value - animatedRouteIndexFloor)) +
      translateXCeil *
        (1 - (animatedRouteIndexCeil - animatedRouteIndex.value));

    const widthFloor =
      tabBarType === 'primary'
        ? routeIndexToTabBarItemWidthMap.value[animatedRouteIndexFloor] ?? 0
        : routeIndexToTabWidthMap.value[animatedRouteIndexFloor] ?? 0;
    const widthCeil =
      tabBarType === 'primary'
        ? routeIndexToTabBarItemWidthMap.value[animatedRouteIndexFloor] ?? 0
        : routeIndexToTabWidthMap.value[animatedRouteIndexCeil] ?? 0;
    const width =
      widthFloor * (1 - (animatedRouteIndex.value - animatedRouteIndexFloor)) +
      widthCeil * (1 - (animatedRouteIndexCeil - animatedRouteIndex.value));
    return { transform: [{ translateX }], width };
  }, [tabBarType]);

  return (
    <Animated.View
      style={[
        styles.tabIndicator,
        styles.primaryTabIndicator,
        style,
        animatedTabIndicatorStyle,
      ]}
    />
  );
});
export default TabIndicator;

const styles = StyleSheet.create({
  tabIndicator: {
    position: 'absolute',
    backgroundColor: 'yellow',
    height: 2,
    bottom: 0,
  },
  primaryTabIndicator: {
    borderTopRightRadius: 2,
    borderTopLeftRadius: 2,
  },
});

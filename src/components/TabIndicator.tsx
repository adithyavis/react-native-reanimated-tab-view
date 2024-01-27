import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { TabIndicatorProps } from '../types/TabIndicator';

const TabIndicator = React.memo((props: TabIndicatorProps) => {
  const { animatedRouteIndex, routeIndexToTabOffsetMap, style } = props;

  const animatedTabIndicatorStyle = useAnimatedStyle(() => {
    const animatedRouteIndexFloor = Math.floor(animatedRouteIndex.value);
    const animatedRouteIndexCeil = animatedRouteIndexFloor + 1;

    const translateXFloor =
      routeIndexToTabOffsetMap[animatedRouteIndexFloor] ?? 0;
    const translateXCeil =
      routeIndexToTabOffsetMap[animatedRouteIndexCeil] ?? 0;
    const translateX =
      translateXFloor *
        (1 - (animatedRouteIndex.value - animatedRouteIndexFloor)) +
      translateXCeil *
        (1 - (animatedRouteIndexCeil - animatedRouteIndex.value));

    const widthFloor =
      (routeIndexToTabOffsetMap[animatedRouteIndexFloor + 1] ?? 0) -
      (routeIndexToTabOffsetMap[animatedRouteIndexFloor] ?? 0);
    const widthCeil =
      (routeIndexToTabOffsetMap[animatedRouteIndexCeil + 1] ?? 0) -
      (routeIndexToTabOffsetMap[animatedRouteIndexCeil] ?? 0);
    const width =
      widthFloor * (1 - (animatedRouteIndex.value - animatedRouteIndexFloor)) +
      widthCeil * (1 - (animatedRouteIndexCeil - animatedRouteIndex.value));
    return { transform: [{ translateX }], width };
  }, [routeIndexToTabOffsetMap]);

  return (
    <Animated.View
      style={[styles.tabIndicator, style, animatedTabIndicatorStyle]}
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
});

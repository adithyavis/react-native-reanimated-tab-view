import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import type { TabBarItemProps } from '../types/TabBarItem';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const TabBarItem = React.memo((props: TabBarItemProps) => {
  const {
    index,
    route,
    animatedRouteIndex,
    jumpTo,
    getLabelText,
    onTabPress,
    onTabLongPress,
    labelStyle,
    style,
  } = props;

  const handlePressTabItem = useCallback(() => {
    const scene = { route };
    onTabPress?.(scene);
    jumpTo(route.key);
  }, [jumpTo, onTabPress, route]);
  const handleLongPressTabItem = useCallback(() => {
    const scene = { route };
    onTabLongPress?.(scene);
    jumpTo(route.key);
  }, [jumpTo, onTabLongPress, route]);

  //   const animatedActiveLabelStyle = useAnimatedStyle(
  //     () => ({
  //       opacity: Math.min(0, 1 - Math.abs(index - 2 * animatedRouteIndex.value)),
  //     }),
  //     [index]
  //   );

  const animatedActiveLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.max(0, 1 - Math.abs(index - animatedRouteIndex.value)),
    };
  }, [index]);

  const animatedInactiveLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.max(0, Math.abs(animatedRouteIndex.value - index)),
    };
  }, [index]);

  const activeLabel = useMemo(() => {
    return (
      <Animated.Text
        style={[styles.activeLabel, animatedActiveLabelStyle, labelStyle]}
      >
        {getLabelText?.({ route })}
      </Animated.Text>
    );
  }, [animatedActiveLabelStyle, getLabelText, labelStyle, route]);
  const inactiveLabel = useMemo(() => {
    return (
      <Animated.Text
        style={[styles.inactiveLabel, animatedInactiveLabelStyle, labelStyle]}
      >
        {getLabelText?.({ route })}
      </Animated.Text>
    );
  }, [animatedInactiveLabelStyle, getLabelText, labelStyle, route]);

  return (
    <TouchableOpacity
      onPress={handlePressTabItem}
      onLongPress={handleLongPressTabItem}
      style={[styles.tabBarItem, style]}
    >
      {activeLabel}
      {inactiveLabel}
    </TouchableOpacity>
  );
});
export default TabBarItem;

const styles = StyleSheet.create({
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeLabel: {
    color: 'black',
  },
  inactiveLabel: {
    position: 'absolute',
    color: 'gray',
  },
});

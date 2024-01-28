import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import type { TabBarItemProps } from '../types/TabBarItem';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const DEFAULT_ACTIVE_COLOR = 'rgba(255, 255, 255, 1)';
const DEFAULT_INACTIVE_COLOR = 'rgba(255, 255, 255, 0.7)';

const TabBarItem = React.memo((props: TabBarItemProps) => {
  const {
    index,
    route,
    animatedRouteIndex,
    activeColor,
    inactiveColor,
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

  const animatedActiveLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.max(0, 1 - Math.abs(index - animatedRouteIndex.value)),
    };
  }, [index]);

  const animatedInactiveLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.min(1, Math.abs(animatedRouteIndex.value - index)),
    };
  }, [index]);

  const activeLabel = useMemo(() => {
    const activeColorStyle = activeColor ? { color: activeColor } : {};
    return (
      <Animated.Text
        style={[
          styles.activeLabel,
          animatedActiveLabelStyle,
          activeColorStyle,
          labelStyle,
        ]}
      >
        {getLabelText?.({ route })}
      </Animated.Text>
    );
  }, [activeColor, animatedActiveLabelStyle, getLabelText, labelStyle, route]);
  const inactiveLabel = useMemo(() => {
    const inactiveColorStyle = inactiveColor ? { color: inactiveColor } : {};
    return (
      <Animated.Text
        style={[
          styles.inactiveLabel,
          animatedInactiveLabelStyle,
          inactiveColorStyle,
          labelStyle,
        ]}
      >
        {getLabelText?.({ route })}
      </Animated.Text>
    );
  }, [
    inactiveColor,
    animatedInactiveLabelStyle,
    getLabelText,
    labelStyle,
    route,
  ]);

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
  },
  activeLabel: {
    color: DEFAULT_ACTIVE_COLOR,
  },
  inactiveLabel: {
    position: 'absolute',
    color: DEFAULT_INACTIVE_COLOR,
  },
});

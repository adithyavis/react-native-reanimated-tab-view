import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import type { TabBarItemProps } from '../types/TabBarItem';
import { StyleSheet } from 'react-native';

const TabBarItem = React.memo((props: TabBarItemProps) => {
  const {
    route,
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

  const label = useMemo(() => {
    return <Text style={labelStyle}>{getLabelText?.({ route })}</Text>;
  }, [getLabelText, labelStyle, route]);

  return (
    <TouchableOpacity
      onPress={handlePressTabItem}
      onLongPress={handleLongPressTabItem}
      style={[styles.tabBarItem, style]}
    >
      {label}
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
});

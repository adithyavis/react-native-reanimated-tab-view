import React from 'react';
import type { ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';
import { View } from 'react-native';
import { useHandleTabLayout } from '../hooks/useTabLayout';

type TabProps = {
  index: number;
  noOfRoutes: number;
  style?: StyleProp<ViewStyle>;
};
const Tab: React.FC<TabProps> = React.memo(
  ({ index, noOfRoutes, style, children }) => {
    const { handleTabLayout } = useHandleTabLayout(index, noOfRoutes);

    return (
      <View onLayout={handleTabLayout} style={style}>
        {children}
      </View>
    );
  }
);

export default Tab;

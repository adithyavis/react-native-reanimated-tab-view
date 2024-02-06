import type { ViewProps } from 'react-native';
import type { SceneRendererProps, TabBarType } from './common';

export type TabIndicatorProps = Omit<ViewProps, 'children'> &
  Omit<SceneRendererProps, 'layout' | 'jumpTo'> & {
    type: TabBarType;
  };

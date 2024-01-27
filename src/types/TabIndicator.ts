import type { ViewProps } from 'react-native';
import type { SceneRendererProps } from './common';
import type { RouteIndexToTabOffsetMap } from './TabBar';

export type TabIndicatorProps = Omit<ViewProps, 'children'> &
  Omit<SceneRendererProps, 'layout' | 'jumpTo'> & {
    routeIndexToTabOffsetMap: RouteIndexToTabOffsetMap;
  };

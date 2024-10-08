# React Native Reanimated Tab View

A Tab View component implemented using [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated/) and [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler/). Props are almost entirely inter-compatible with [`react-native-tab-view`](https://github.com/satya164/react-native-tab-view)

- The [example/](https://github.com/adithyavis/react-native-reanimated-tab-view/tree/main/example) folder contains reference code to use the library.

## Demo

<a href="https://github.com/adithyavis/react-native-reanimated-tab-view/raw/main/assets/assets_demo.mp4"><img src="https://github.com/adithyavis/react-native-reanimated-tab-view/raw/main/assets/assets_demo.gif" width="360"></a>

## Features

react-native-reanimated-tab-view provides the following features that are provided by react-native-tab-view

> - Smooth animations and gestures
> - Scrollable tabs
> - Supports both top and bottom tab bars
> - Follows Material Design spec
> - Highly customizable
> - Fully typed with [TypeScript](https://typescriptlang.org)

Additionally, react-native-reanimated-tab-view also provides the following features

> - 3 modes to render the tab view ("normal", "window" and "lazy")
> - Dynamic widths for tabs
> - Customisable jump animations (smooth jump or scroll jump)

#### Upcoming features

> - Accessibility
> - RTL support
> - TabView collapsible Headers

## Motivation

1.  [`react-native-tab-view`](https://github.com/satya164/react-native-tab-view) is an amazing package,
    but the dependency on [`react-native-pager-view`](https://github.com/callstack/react-native-pager-view)
    complicates solving issues such as

- [`TabView tab index not really controlled`](https://github.com/react-navigation/react-navigation/issues/11412)
- [`Tab label aligning vertically in some devices when render single tab.`](https://github.com/react-navigation/react-navigation/issues/11083)
- [`Screen getting stuck when switching between the tabs while keyboard opened.`](https://github.com/react-navigation/react-navigation/issues/11301).

react-native-reanimated-tab-view depends purely on [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated/), and hence the above issues won't be encountered.

2.  The animation and gesture primitives offered by [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated/) and [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler/) help in making swipe and jump behaviors of TabView more controllable.

## Installation

Install react-native-reanimated (>=2.x) and react-native-gesture-handler (>=2.x).

- https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/installation
- https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation

Open a Terminal in the project root and run:

```sh
yarn add react-native-reanimated-tab-view
```

## Quick Start

```js
import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-reanimated-tab-view';

const FirstRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);

const renderScene = ({ route }) => {
  switch (route.key) {
    case 'first':
      return <FirstRoute />;
    case 'second':
      return <SecondRoute />;
    default:
      return null;
  }
};

export default function TabViewExample() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}
```

| Name                | Description                                                 | Required | Type     | Default  |
| ------------------- | ----------------------------------------------------------- | -------- | -------- | -------- |
| navigationState     | The state of the navigation including the index and routes. | Yes      | Object   |          |
| renderScene         | A function that renders the scene for a given route.        | Yes      | Function |          |
| onIndexChange       | A function that is called when the index changes.           | Yes      | Function |          |
| initialLayout       | The initial layout of the tab view.                         | No       | Object   | {}       |
| sceneContainerStyle | The style for the scene container.                          | No       | Object   | {}       |
| keyboardDismissMode | Specifies how to dismiss the keyboard.                      | No       | String   | 'none'   |
| swipeEnabled        | Enables or disables swipe gestures.                         | No       | Boolean  | true     |
| mode                | Specifies the layout mode of the tab view.                  | No       | String   | 'window' |
| tabBarPosition      | Specifies the position of the tab bar.                      | No       | String   | 'top'    |
| smoothJump          | Enables or disables smooth jumping between tabs.            | No       | Boolean  | true     |
| renderTabBar        | A function that renders the tab bar.                        | No       | Function | () => {} |
| onSwipeEnd          | A function that is called when a swipe gesture ends.        | No       | Function | () => {} |
| onSwipeStart        | A function that is called when a swipe gesture starts.      | No       | Function | () => {} |

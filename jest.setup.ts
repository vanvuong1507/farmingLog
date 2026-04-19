import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual(
    'react-native-safe-area-context',
  ) as typeof import('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  mergeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-localize', () => ({
  getLocales: () => [{languageTag: 'en-US'}],
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getVersion: () => '0.0.0',
    getBuildNumber: () => '1',
  },
}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const {View} = require('react-native');
  return ({children, ...props}: Record<string, unknown>) =>
    React.createElement(View, props, children);
});

jest.mock('react-native-skeleton-placeholder', () => {
  const React = require('react');
  const {View} = require('react-native');
  const Item = ({children, ...props}: Record<string, unknown>) =>
    React.createElement(View, props, children);
  const Placeholder = ({children}: {children?: React.ReactNode}) =>
    React.createElement(View, null, children);
  (Placeholder as {Item?: unknown}).Item = Item;
  return {__esModule: true, default: Placeholder};
});

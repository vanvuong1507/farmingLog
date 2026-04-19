import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from '@app/store/store';
import {ThemeNavigationContainer} from '@app/navigation/ThemeNavigationContainer';
import {RootNavigator} from '@app/navigation/RootNavigator';
import {ErrorBoundary} from '@app/ErrorBoundary';
import {DbBootstrapError} from '@app/components/DbBootstrapError';
import {AppBootPhase, useAppBootstrap} from '@app/hooks/useAppBootstrap';
import {ThemeProvider} from '@ui/theme';
import {useTheme} from 'react-native-paper';

const AppContent = () => {
  const paperTheme = useTheme();

  return (
    <SafeAreaView
      style={[styles.root, {backgroundColor: paperTheme.colors.background}]}>
      <GestureHandlerRootView style={styles.navContainer}>
        <RootNavigator />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const SPLASH_BG = '#1B5E20';

function App(): React.JSX.Element {
  const boot = useAppBootstrap();

  useEffect(() => {
    if (boot.phase === AppBootPhase.Loading) {
      return;
    }
    BootSplash.hide({fade: true}).catch(() => {});
  }, [boot.phase]);

  if (boot.phase === AppBootPhase.Loading) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <View style={styles.bootSplashPlaceholder} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (boot.phase === AppBootPhase.Error && boot.errorMessage != null) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <DbBootstrapError
            message={boot.errorMessage}
            onRetry={boot.retry}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemeProvider>
          <ErrorBoundary>
            <ThemeNavigationContainer>
              <AppContent />
            </ThemeNavigationContainer>
          </ErrorBoundary>
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  bootSplashPlaceholder: {flex: 1, backgroundColor: SPLASH_BG},
  navContainer: {flex: 1},
});

export default App;

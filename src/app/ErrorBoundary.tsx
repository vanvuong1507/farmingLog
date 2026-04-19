import React, {Component, type ErrorInfo, type ReactNode} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import i18n from '@libs/i18n';
import {logger} from '@libs/logger';

type Props = {children: ReactNode};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary', info.componentStack ?? error.message, error);
  }

  private readonly handleReset = (): void => {
    this.setState({hasError: false});
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.title}>{i18n.t('appCrashTitle')}</Text>
          <Text style={styles.hint}>{i18n.t('appCrashHint')}</Text>
          <Pressable style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonLabel}>{i18n.t('tryAgain')}</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {fontSize: 18, fontWeight: '700'},
  hint: {fontSize: 14, opacity: 0.85},
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#1f6feb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonLabel: {color: '#fff', fontWeight: '600'},
});

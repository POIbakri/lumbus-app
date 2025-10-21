import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../../lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service (e.g., Sentry)
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: 24}}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: 20, marginTop: 16}}>
            Something went wrong
          </Text>
          <Text className="font-bold text-center" style={{color: '#666666', fontSize: 14, marginTop: 8, marginBottom: 24}}>
            We're sorry for the inconvenience. Please try again.
          </Text>

          {__DEV__ && this.state.error && (
            <View className="rounded-2xl w-full" style={{backgroundColor: '#FEF2F2', borderWidth: 2, borderColor: '#FCA5A5', padding: 16, marginBottom: 24}}>
              <Text className="font-mono" style={{color: '#991B1B', fontSize: 10}}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="rounded-2xl"
            style={{backgroundColor: '#2EFECC', paddingHorizontal: 24, paddingVertical: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8}}
            onPress={this.handleReset}
            activeOpacity={0.8}
          >
            <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: 14}}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

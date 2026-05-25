import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getTheme } from '../lib/theme';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryInner extends React.Component<AppErrorBoundaryProps & { scheme: ReturnType<typeof getTheme> }, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  public componentDidCatch(): void {}

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
    });
  };

  public render(): React.JSX.Element {
    const { children, scheme } = this.props;

    if (!this.state.hasError) {
      return <>{children}</>;
    }

    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: scheme.colors.background }}
      >
        <Card className="w-full max-w-[420px] rounded-[28px]">
          <Text className="text-[26px] font-semibold" style={{ color: scheme.colors.text }}>
            Something went wrong
          </Text>
          <Text className="mt-3 text-[15px] leading-7" style={{ color: scheme.colors.textMuted }}>
            The app hit an unexpected issue while rendering this screen. You can try loading the
            experience again without losing your session state.
          </Text>
          <Button className="mt-6" onPress={this.handleRetry} text="Try Again" />
        </Card>
      </View>
    );
  }
}

/**
 * Wraps the mobile app tree in a themed React error boundary.
 */
export default function AppErrorBoundary({
  children,
}: AppErrorBoundaryProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return <ErrorBoundaryInner scheme={theme}>{children}</ErrorBoundaryInner>;
}

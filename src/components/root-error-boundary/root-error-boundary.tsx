import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import ErrorDisplay from '@/components/error-display';

/**
 * Shown when the root boundary catches a render error (avoids a totally blank screen).
 */
export function RootErrorFallback({ error }: { error: unknown }) {
  return (
    <div className='light flex min-h-screen flex-col bg-background p-6 text-foreground'>
      <h1 className='mb-3 text-lg font-semibold'>Something went wrong</h1>
      <ErrorDisplay error={error} />
      <Button type='button' variant='outline' className='mt-4 w-fit' onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}

type Props = { children: ReactNode };

type State = { error: unknown | null };

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('React root error:', error, info.componentStack);
  }

  render() {
    if (this.state.error != null) {
      return <RootErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

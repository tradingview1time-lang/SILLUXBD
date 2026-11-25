import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFBF8] text-[#1A1612] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-[#DFCFAF] p-8 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8C641E] font-semibold">
              Sillux
            </p>
            <h1 className="text-xl font-bold">Unable to display this view</h1>
            <p className="text-sm text-[#5C5347]">
              Please reload the page to restore the Sillux collection.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#1A1612] text-white text-xs font-semibold cursor-pointer hover:bg-[#9A7228] transition-colors"
            >
              Reload Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

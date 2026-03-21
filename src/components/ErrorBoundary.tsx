import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Globe render failed:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
        borderRadius: '24px',
        background: 'radial-gradient(circle at 50% 35%, rgba(59,130,246,0.22), rgba(8,15,36,0.9) 72%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(2,8,23,0.35)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, rgba(147,197,253,0.9), rgba(29,78,216,0.9) 58%, rgba(15,23,42,0.98) 100%)',
          boxShadow: '0 0 50px rgba(59,130,246,0.3)',
        }} />
        <div>
          <h2 style={{
            margin: '0 0 8px 0',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '20px',
            color: '#ffffff',
            letterSpacing: '1px',
          }}>
            {this.props.title || 'Globe unavailable'}
          </h2>
          <p style={{
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.5,
          }}>
            {this.state.errorMessage || 'The interactive globe failed to load on this device.'}
          </p>
        </div>
        <button
          type="button"
          onClick={this.handleReload}
          style={{
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '999px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          点击刷新
        </button>
      </div>
    );
  }
}

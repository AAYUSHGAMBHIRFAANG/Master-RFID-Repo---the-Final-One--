import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1>Something went wrong 🙈</h1>
          <p>Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

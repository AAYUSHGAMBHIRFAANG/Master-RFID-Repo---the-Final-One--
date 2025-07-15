// apps/frontend/src/pages/PCoordinatorDashboard.jsx
import React from 'react';

// Basic placeholder style
const styles = {
  container: {
    padding: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.2rem',
    color: '#555',
  }
};

export default function PCoordinatorDashboard() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Program Coordinator Dashboard</h1>
      <p style={styles.text}>
        Welcome, Administrator. This area is under construction.
      </p>
    </div>
  );
}
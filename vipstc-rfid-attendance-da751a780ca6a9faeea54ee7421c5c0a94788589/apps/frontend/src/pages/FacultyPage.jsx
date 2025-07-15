// apps/frontend/src/pages/FacultyPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  facultyPageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#f0f2f5',
    minHeight: 'calc(100vh - 80px)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '40px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px', // Space between buttons
  },
  actionButton: {
    backgroundColor: '#A80014', // VIPS Dark Red
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '15px 30px',
    fontSize: '1.2rem',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '350px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.2s, transform 0.2s',
  },
  backButton: {
    backgroundColor: '#650008', // Darker red for back
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '40px',
    transition: 'background-color 0.2s',
  },
};

export default function FacultyPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.facultyPageContainer}>
      <h2 style={styles.title}>SELECT AN OPTION</h2>
      <div style={styles.buttonContainer}>
        <button 
          style={styles.actionButton}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c2001f'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#A80014'}
        >
          VIEW/EDIT FACULTY
        </button>
        <button 
          style={styles.actionButton}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c2001f'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#A80014'}
        >
          ADD NEW FACULTY
        </button>
        <button 
          style={styles.actionButton}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c2001f'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#A80014'}
        >
          ASSIGN FACULTY
        </button>
      </div>
      <button 
        style={styles.backButton}
        onClick={() => navigate(-1)} // Navigates back to the previous page
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7f000e'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#650008'}
      >
        back
      </button>
    </div>
  );
}
// apps/frontend/src/pages/PCoordinatorDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Inline CSS styles based on your Figma design
const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#f0f2f5', // A light grey background
    minHeight: 'calc(100vh - 80px)', // Adjust based on your header height
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#8B0000', // VIPS Red
    marginBottom: '40px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '40px',
    maxWidth: '800px',
  },
  card: {
    backgroundColor: '#FFF0F0',
    border: '1px solid #E0E0E0',
    borderRadius: '15px',
    padding: '40px',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    minWidth: '250px',
    minHeight: '150px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default function PCoordinatorDashboard() {
  const navigate = useNavigate();

  // Handler to navigate to the faculty page
  const handleFacultyClick = () => {
    navigate('/dashboard/pcoord/faculty');
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.cardGrid}>
        {/* Faculty Card */}
        <div 
          style={styles.card} 
          onClick={handleFacultyClick}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          Faculty
        </div>

        {/* Classes Card */}
        <div style={styles.card}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';}}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';}}>
          Classes
        </div>

        {/* Timetables/Schedules Card */}
        <div style={styles.card}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';}}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';}}>
          Timetables/Schedules
        </div>

        {/* Attendance Reports Card */}
        <div style={styles.card}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';}}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';}}>
          Attendance Reports
        </div>
      </div>
    </div>
  );
}
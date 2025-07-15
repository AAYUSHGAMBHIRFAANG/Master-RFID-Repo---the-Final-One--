import React from 'react';
import { useNavigate } from 'react-router-dom';

// Inline CSS styles based on your Figma design
const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#fff', // White background
    minHeight: 'calc(100vh - 80px)', 
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '40px',
    maxWidth: '800px',
  },
  card: {
    backgroundColor: '#FFF0F0', // Light pink background
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
  // Hover effect style
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  }
};

export default function PCoordinatorDashboard() {
  const navigate = useNavigate();

  // Handler to navigate to the faculty page
  const handleFacultyClick = () => {
    navigate('/dashboard/pcoord/faculty');
  };
  
  // A helper for the hover effect
  const handleMouseOver = (e) => {
    Object.assign(e.currentTarget.style, styles.cardHover);
  };
  
  const handleMouseOut = (e) => {
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = styles.card.boxShadow;
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.cardGrid}>
        {/* Faculty Card */}
        <div 
          style={styles.card} 
          onClick={handleFacultyClick}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Faculty
        </div>

        {/* Classes Card */}
        <div 
          style={styles.card}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Classes
        </div>

        {/* Timetables/Schedules Card */}
        <div 
          style={styles.card}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Timetables/Schedules
        </div>

        {/* Attendance Reports Card */}
        <div 
          style={styles.card}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Attendance Reports
        </div>
      </div>
    </div>
  );
}
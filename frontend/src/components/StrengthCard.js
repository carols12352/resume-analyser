import React from 'react';

const StrengthCard = ({ strength }) => {
  return (
    <div className="strength-card">
      <div className="strength-content">
        <span className="strength-icon">💪</span>
        <p>{strength}</p>
      </div>
    </div>
  );
};

export default StrengthCard; 
import React from 'react';

const ErrorMessage = ({ message, icon = '⚠️' }) => {
  return (
    <div className="error-message">
      <span className="error-icon">{icon}</span>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage; 
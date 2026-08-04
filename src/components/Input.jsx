import React from 'react';

const Input = ({ label, id, error, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input
        id={id}
        className={`input-field ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <p className="text-error">{error}</p>}
    </div>
  );
};

export default Input;

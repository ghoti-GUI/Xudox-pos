import React from 'react';

function Box({ title, children }) {
  return (
    <div >
      <h2 >{title}</h2>
      {children}
    </div>
  );
}

export default Box;
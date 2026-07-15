import React from 'react';

const Error = ({ message }) => {  // <-- destructure props here
  return (
    <div>
      <div className="alert alert-danger" role="alert">
        {message}
      </div>
    </div>
  );
}

export default Error;

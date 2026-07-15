import React from 'react'
import HashLoader from "react-spinners/HashLoader";

const Loader = () => {
  const loading = true;

  return (
    <div 
      style={{
        display: "flex",
        justifyContent: "center",   // horizontal center
        alignItems: "center",       // vertical center
        height: "100vh"             // full viewport height
      }}
    >
      <HashLoader color="#000" loading={loading} size={80} />
    </div>
  );
}

export default Loader;

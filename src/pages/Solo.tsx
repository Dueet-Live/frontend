import React from 'react';
import { Link } from 'react-router-dom';

const Solo: React.FC = () => {
  return (
    <>
      <h3>Solo</h3>
      <Link to="/">
        <button>Back</button>
      </Link>
    </>
  );
};

export default Solo;

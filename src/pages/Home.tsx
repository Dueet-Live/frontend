import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h3>Dueet Live</h3>

      <Link to="/duet">
        <button>Duet</button>
      </Link>
      <Link to="/solo">
        <button>Solo</button>
      </Link>
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/solar-maintenance">Solar Maintenance</Link></li>
        {/* Add other navigation links as needed */}
      </ul>
    </nav>
  );
};

export default Navbar;

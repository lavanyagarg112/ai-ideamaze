import React from 'react';
import classes from './Layout.module.css';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {

    const navigate = useNavigate();

    const handleReload = () => {
      navigate(0)
    }

  return (

    <div className={classes.navigation}>
      <div className={classes.header}>AI IdeaMaze</div>
      <nav className={classes.navbar}>
      <button className={classes.navButton}>
          <Link to="/aboutus" className={classes.buttonLink}>About Us</Link>
        </button>
        <button className={classes.navButton} onClick={handleReload}>
          <Link to="/" className={classes.buttonLink}>New Maze</Link>
        </button>
      </nav>
    </div>
  );
}

export default Navigation;

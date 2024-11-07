import React from 'react';
import style from '../Styles/Sidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHeart, faFilm, faTv, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Logout function to clear localStorage and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data from localStorage
    navigate('/login'); // Redirect to login page
  };

  // Function to check if the current path matches the given path
  const isActive = (path) => location.pathname === path;

  return (
    <div className={style.navCont}>
      <div 
        className={`${style.iconContainer} ${isActive('/home') ? style.active : ''}`} 
        onClick={() => handleNavigation('/home')}
      >
        <FontAwesomeIcon icon={faHome} className={style.icon} />
        <span className={style.iconLabel}>Home</span>
      </div>
      <div 
        className={`${style.iconContainer} ${isActive('/favoritelist') ? style.active : ''}`} 
        onClick={() => handleNavigation('/favoritelist')}
      >
        <FontAwesomeIcon icon={faHeart} className={style.icon} />
        <span className={style.iconLabel}>Favorites</span>
      </div>
      <div 
        className={`${style.iconContainer} ${isActive('/movies') ? style.active : ''}`} 
        onClick={() => handleNavigation('/movies')}
      >
        <FontAwesomeIcon icon={faFilm} className={style.icon} />
        <span className={style.iconLabel}>Movies</span>
      </div>
      <div 
        className={`${style.iconContainer} ${isActive('/tvshow') ? style.active : ''}`} 
        onClick={() => handleNavigation('/tvshow')}
      >
        <FontAwesomeIcon icon={faTv} className={style.icon} />
        <span className={style.iconLabel}>TV Shows</span>
      </div>
      <div 
        className={style.iconContainer} 
        onClick={handleLogout} // Call logout function on click
      >
        <FontAwesomeIcon icon={faSignOutAlt} className={style.icon} />
        <span className={style.iconLabel}>Logout</span>
      </div>
    </div>
  );
}

export default Sidebar;

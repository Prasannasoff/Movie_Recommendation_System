import React from 'react';
import style from '../Styles/Sidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHeart, faFilm, faTv } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
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
        className={`${style.iconContainer} ${isActive('/Favourite') ? style.active : ''}`} 
        onClick={() => handleNavigation('/Favourite')}
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
    </div>
  );
}

export default Sidebar;

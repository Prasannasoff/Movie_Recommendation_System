import React from 'react';
import style from '../Styles/Sidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHeart, faFilm, faTv } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; 
function Sidebar() {
  const navigate = useNavigate();
  const handleNavigation=(path)=>{
    navigate(path);
  }
  return (
    <div className={style.navCont}>
      <div className={style.iconContainer} onClick={()=>handleNavigation('/home')}>
        <FontAwesomeIcon icon={faHome} className={style.icon} />
        <span className={style.iconLabel}>Home</span>
      </div>
      <div className={style.iconContainer} onClick={()=>handleNavigation('/Favourite')}>
        <FontAwesomeIcon icon={faHeart} className={style.icon}/>
        <span className={style.iconLabel}>Favorites</span>
      </div>
      <div className={style.iconContainer} onClick={()=>handleNavigation('/home')}>
        <FontAwesomeIcon icon={faFilm} className={style.icon} />
        <span className={style.iconLabel}>Movies</span>
      </div>
      <div className={style.iconContainer} onClick={()=>handleNavigation('/tvshow')}>
        <FontAwesomeIcon icon={faTv} className={style.icon} />
        <span className={style.iconLabel}>TV Shows</span>
      </div>
    </div>
  );
}

export default Sidebar;

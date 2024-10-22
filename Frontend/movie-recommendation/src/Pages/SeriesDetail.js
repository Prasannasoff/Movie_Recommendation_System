import React from 'react';
import { useLocation } from 'react-router-dom';
import style from '../Styles/MovieDetail.module.css';
import Sidebar from '../Components/Sidebar';

function SeriesDetail() {
    const location = useLocation();
    const { seriesDetail } = location.state;

    const posterUrl = `https://image.tmdb.org/t/p/w500${seriesDetail.poster_path}`; // Construct the full URL for the poster image

    return (
        <div className={style.detailCont}>
            <Sidebar />
            <div className={style.innerCont}>
                <img src={posterUrl} alt={seriesDetail.name} width="300" className={style.seriesDetailPoster} />
                <div className={style.movieDetailCont}>
                    <h1 style={{ color: 'white' }}>{seriesDetail.name}</h1>
                    
                    <div className={style.otherMovieDetail}>
                        <div className={style.ratingCont}>
                            <div className={style.rateImgCont}>
                                <img src='imdb.png' className={style.imdbPng} alt='IMDb' />
                            </div>
                            <div>{Number(seriesDetail.vote_average).toFixed(2)}</div>
                        </div>
                    </div>

                    <div className={style.languageCont}>
                        <div className={style.languageImgCont}>
                            <img src='translate.png' className={style.languagePng} alt='Languages' />
                        </div>
                        <div className={style.languageList}>
                            <div>{seriesDetail.original_language}</div>
                        </div>
                    </div>

                    <div className={style.movieDesc}>{seriesDetail.overview}</div>
                    <div style={{ color: 'white', marginTop: '5px' }}>Release Date: {seriesDetail.first_air_date}</div>
                </div>
            </div>
        </div>
    );
}

export default SeriesDetail;

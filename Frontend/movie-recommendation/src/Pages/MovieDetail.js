import React from 'react'
import { useLocation } from 'react-router-dom';
import style from '../Styles/MovieDetail.module.css'
import Sidebar from '../Components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
function MovieDetail() {
    const location = useLocation();
    const { movie } = location.state;
    console.log(movie)
    console.log(movie.poster_url)

    return (
        <div className={style.detailCont}>
            <Sidebar />
            <div className={style.innerCont}>
                <div className={style.mainCont}>
                    <img src={movie.poster_url} alt={movie.title} width="300" className={style.moviePoster} />
                    <div className={style.movieDetailCont}>
                        <div className={style.title}>{movie.title}</div>

                        {/* Check if genres is defined */}
                        <div className={style.genresCont}>
                            {movie.genres && movie.genres.map(data =>
                                <div className={style.genres} key={data}>{data}</div>
                            )}
                        </div>

                        <div className={style.otherMovieDetail}>
                            <div className={style.ratingCont}>
                                <div className={style.rateImgCont}>
                                    <img src='imdb.png' className={style.imdbPng} alt='IMDb' />
                                </div>
                                <div>{Number(movie.rating).toFixed(2)}</div>
                            </div>
                            <div className={style.runtimeCont}>
                                <div className={style.runtimeImgCont}>
                                    <img src='movie duration.png' className={style.runtimePng} alt='Runtime' />
                                </div>
                                <div>{movie.runtime} min</div>
                            </div>
                            <div className={style.runtimeCont}>
                                <div className={style.runtimeImgCont}>
                                    <img src='dollar.png' className={style.runtimePng} alt='Runtime' />
                                </div>
                                <div>{movie.budget}</div>
                            </div>
                        </div>

                        {/* Check if spoken_languages is defined */}
                        <div className={style.languageCont}>
                            <div className={style.languageImgCont}>
                                <img src='translate.png' className={style.languagePng} alt='Languages' />
                            </div>
                            <div className={style.languageList}>
                                {movie.spoken_languages && movie.spoken_languages.map((data, index) =>
                                    <div key={index}>{data},</div>
                                )}
                            </div>
                        </div>

                        <div className={style.movieDesc}>{movie.description}</div>

                        <div style={{ color: 'white', marginTop: '5px' }}>Release Date: {movie.release_date}</div>
                        <div className={style.buttonCont}>
                            {/* Add the Watch Trailer button */}
                            {movie.trailer !== 'Trailer not available' && (
                                <div className={style.trailerButtonCont}>
                                    <button
                                        className={style.trailerButton}
                                        onClick={() => window.open(movie.trailer, '_blank')}
                                    >
                                        WATCH TRAILER
                                    </button>
                                </div>
                            )}
                            <div className={style.favouriteButton}>
                                <div style={{ display: 'flex' ,alignItems:'center',gap:'10px'}}>
                                    <div>TO WATCHLIST</div>
                                    <FontAwesomeIcon icon={faPlus} className={style.icon} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.castCont}>
                        <hr />
                        <div className={style.castDetail}>
                            <div style={{ color: 'rgb(50,71,121)', fontSize: '25px', fontWeight: 600 }}>Director</div>
                            <div style={{ color: 'grey', fontSize: '20px' }}>{movie.director}</div>
                        </div>
                        <hr />

                        <div className={style.castDetail}>
                            <div style={{ color: 'rgb(50,71,121)', fontSize: '25px', fontWeight: 600 }}>Writers</div>
                            {movie.writers.map(data => <div style={{ color: 'grey', fontSize: '20px' }}>{data} </div>)}
                        </div>
                        <hr />
                        <div className={style.castDetail}>
                            <div style={{ color: 'rgb(50,71,121)', fontSize: '25px', fontWeight: 600 }}>Stars</div>
                            <div style={{ color: 'grey', fontSize: '20px' }}>{movie.hero} . {movie.heroine}</div>
                        </div>
                        <hr />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default MovieDetail;

import React from 'react'
import { useLocation } from 'react-router-dom';
import style from '../Styles/MovieDetail.module.css'

function MovieDetail() {
    const location = useLocation();
    const { movie } = location.state;
    console.log(movie)
    console.log(movie.rating)

    return (
        <div className={style.detailCont}>
            <div className={style.innerCont}>
                <img src={movie.poster} alt={movie.title} width="300" className={style.moviePoster} />
                <div className={style.movieDetailCont}>
                    <h1 style={{ color: 'white' }}>{movie.title}</h1>
                    
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
                    </div>

                    {/* Check if spoken_languages is defined */}
                    <div className={style.languageCont}>
                        <div className={style.languageImgCont}>
                            <img src='translate.png' className={style.languagePng} alt='Languages' />
                        </div>
                        <div>
                            {movie.spoken_languages && movie.spoken_languages.map((data, index) => 
                                <div key={index}>{data}</div>
                            )}
                        </div>
                    </div>

                    <div className={style.movieDesc}>{movie.description}</div>

                    <div style={{ color: 'white', marginTop: '5px' }}>Release Date: {movie.release_date}</div>

                    {/* Add the Watch Trailer button */}
                    {movie.trailer !== 'Trailer not available' && (
                        <div className={style.trailerButtonCont}>
                            <button 
                                className={style.trailerButton} 
                                onClick={() => window.open(movie.trailer, '_blank')}
                            >
                                Watch Trailer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MovieDetail;

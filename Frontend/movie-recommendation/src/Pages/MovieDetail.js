import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import style from '../Styles/MovieDetail.module.css';
import Sidebar from '../Components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { faPlus, faCheck, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
function MovieDetail() {
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const location = useLocation();
    const [user] = useAuthState(auth);
    const { movie } = location.state;
    console.log("MovieDetail", movie);
    const [isFavorite, setIsFavorite] = useState(false); 
    const [addToFavorites, setAddToFavorites] = useState(false);

    useEffect(() => {
       
        const checkIfFavorite = async () => {
            try {
                const userRef = doc(db, 'users', user.uid, 'favorites', movie.title);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    setIsFavorite(true); 
                }
            } catch (error) {
                console.error("Error checking if movie is favorite: ", error);
            }
        };

        if (user) {
            checkIfFavorite(); 
        }
    }, [user, movie.title]);

    const handleAddToFavorites = async () => {
        try {

            const movieData = {
                id: movie.id,
                title: movie.title,
                moviePoster: movie.poster_url,
                rating: movie.rating,
            };

            const userRef = doc(db, 'users', user.uid, 'favorites', movie.title);

            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                toast.warn("Already added to Favorite", { position: "top-center" });
                console.log("Movie already added to favorites");
                return;
            }

            
            await setDoc(userRef, {
                movieData: [movieData],
            });

            toast.success("Added to Favorites", { position: "top-center" });
            setIsFavorite(true); 
        } catch (error) {
            console.error("Error adding movie to favorites: ", error);
        }
    };
    const toggleSidebar = () => {
        setSidebarOpen(prevState => !prevState);
    };
    return (
        <div className={style.detailCont}>
            <button className={style.toggleButton} onClick={toggleSidebar}>
                ☰ 
            </button>

            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
            <div className={style.innerCont}>
                <div className={style.mainCont}>
                    <img src={movie.poster_url} alt={movie.title} width="300" className={style.moviePoster} />
                    <div className={style.movieDetailCont}>
                        <div className={style.title}>{movie.title}</div>

                    
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={handleAddToFavorites}>
                                    <div>{isFavorite ? 'ADDED TO FAVORITES' : 'TO WATCHLIST'}</div>
                                    <FontAwesomeIcon icon={isFavorite ? faCheck : faPlus} className={style.icon} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.castCont}>
                        <hr />
                        <div style={{ display: 'flex' }}>
                            <div className={style.castDetail}>
                                <div style={{ color: 'rgb(50,71,121)', fontSize: '25px', fontWeight: 600 }}>Director</div>
                                <div style={{ color: 'grey', fontSize: '20px' }}>{movie.director}</div>
                            </div>
                            <div style={{ paddingTop: '20px' }}>
                                <a
                                    href={`https://www.google.com/search?q=${encodeURIComponent(movie.director)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FontAwesomeIcon icon={faAngleRight} color='red' size='1x' />
                                </a>
                            </div>
                        </div>
                        <hr />
                        <div className={style.castDetail}>
                            <div style={{ color: 'rgb(50,71,121)', fontSize: '25px', fontWeight: 600 }}>Writers</div>
                            {movie.writers.map(data => <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(data)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            ><div style={{ color: 'grey', fontSize: '20px' }} className={style.castName}>{data} </div></a>)}
                        </div>
                        <hr />
                        <div className={style.castDetail}>
                            <div style={{ color: 'rgb(50,71,121)', fontSize: '25px', fontWeight: 600 }}>Stars</div>
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(movie.hero)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <div style={{ color: 'grey', fontSize: '20px' }} className={style.castName}>{movie.hero}</div>
                            </a>
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(movie.heroine)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <div style={{ color: 'grey', fontSize: '20px' }} className={style.castName}>{movie.heroine}</div>
                            </a>
                        </div>
                        <hr />
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default MovieDetail;

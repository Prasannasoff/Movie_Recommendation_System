import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import style from '../Styles/MovieDetail.module.css';
import Sidebar from '../Components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { db, auth } from '../firebaseConfig'; 
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { faPlus, faCheck,faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
function MovieDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useAuthState(auth); 
    const { movie } = location.state;
    console.log("MovieDetail", movie);
    const [isFavorite, setIsFavorite] = useState(false); // Track if the movie is in favorites
    const [addToFavorites, setAddToFavorites] = useState(false);

    useEffect(() => {
        // Check if the movie is already in the user's favorites
        const checkIfFavorite = async () => {
            try {
                const userRef = doc(db, 'users', user.uid, 'favorites', movie.title);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    setIsFavorite(true); // Movie is already in favorites
                }
            } catch (error) {
                console.error("Error checking if movie is favorite: ", error);
            }
        };

        if (user) {
            checkIfFavorite(); // Check if the user is logged in and movie is in favorites
        }
    }, [user, movie.title]);

    const handleAddToFavorites = async () => {
        try {
            // Movie data to add to favorites
            const movieData = {
                id: movie.id,
                title: movie.title,
                moviePoster: movie.poster_url,
                rating: movie.rating,
            };

            // Reference to the current user's favorites collection
            const userRef = doc(db, 'users', user.uid, 'favorites', movie.title);

            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                toast.warn("Already added to Favorite", { position: "top-center" });
                console.log("Movie already added to favorites");
                return;
            }

            // Add the movie to the user's favorites list (create a new document if it doesn't exist)
            await setDoc(userRef, {
                movieData: [movieData], // Store the movie in an array as it's the first entry
            });

            toast.success("Added to Favorites", { position: "top-center" });
            setIsFavorite(true); // Update state after successful addition
        } catch (error) {
            console.error("Error adding movie to favorites: ", error);
        }
    };

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

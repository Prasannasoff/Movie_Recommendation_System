import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/FavoritePage.module.css';
import Sidebar from '../Components/Sidebar';

function FavouritePage() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (user) {
            const fetchFavorites = async () => {
                try {
                    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
                    const querySnapshot = await getDocs(favoritesRef);

                    const favoriteMovies = querySnapshot.docs.map(doc => ({ ...doc.data().movieData[0], id: doc.id }));
                    setFavorites(favoriteMovies);
                } catch (error) {
                    console.error("Error fetching favorites: ", error);
                }
            };

            fetchFavorites();
        }
    }, [user]);

    const handleSelect = async (movieDetail) => {
        const response = await axios.post('http://localhost:5000/getSelectedMovie', { id: movieDetail.id, title: movieDetail.title });
        console.log("Selected Movie", response.data);
        const movie = response.data;
        navigate('/moviedetail', { state: { movie } });
    };

    const handleDelete = async (movieId) => {
        if (!user) return;
        try {
            const movieRef = doc(db, 'users', user.uid, 'favorites', movieId);
            await deleteDoc(movieRef);
            setFavorites(prevFavorites => prevFavorites.filter(movie => movie.id !== movieId));
            console.log("Movie deleted successfully");
        } catch (error) {
            console.error("Error deleting favorite: ", error);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(prevState => !prevState);
    };

    return (
        <div className={styles.favoritesPage}>
            <button className={styles.toggleButton} onClick={toggleSidebar}>
                ☰
            </button>

            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
            <div className={styles.favoritesContainer}>
                <h2 className={styles.title}>Favorites</h2>
                {favorites.length > 0 ? (
                    favorites.map((movie, index) => (
                        <div
                            className={styles.movieCard}
                            key={index}
                        >
                            <img className={styles.moviePoster} src={movie.moviePoster} alt={movie.title} />
                            <div className={styles.movieInfo}>
                                <h3 className={styles.movieTitle}>{movie.title}</h3>
                                <div className={styles.movieRating}>
                                    <span>Rating: {movie.rating}</span>
                                </div>
                                <div style={{ display: 'flex',gap:'10px',marginTop:'10px'}}>
                                    <button className={styles.deleteButton} onClick={() => handleDelete(movie.id)}>
                                        Delete
                                    </button>
                                    <button className={styles.selectButton} onClick={() => handleSelect(movie)}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noFavoritesMessage}>No favorites added yet.</p>
                )}
            </div>
        </div>
    );
}

export default FavouritePage;

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Import required methods
import { getDocs, collection } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/FavoritePage.module.css'; // Import the CSS module
import Sidebar from '../Components/Sidebar';
function FavouritePage() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [user] = useAuthState(auth); // Get the current user

    useEffect(() => {
        if (user) {
            // Fetch favorite movies for the current user
            const fetchFavorites = async () => {
                try {
                    const favoritesRef = collection(db, 'users', user.uid, 'favorites'); // Reference to the user's favorites subcollection
                    const querySnapshot = await getDocs(favoritesRef); // Get all documents from this collection

                    const favoriteMovies = querySnapshot.docs.map(doc => doc.data().movieData[0]); // Assuming movieData is stored as an array
                    setFavorites(favoriteMovies); // Update state with the favorite movies
                } catch (error) {
                    console.error("Error fetching favorites: ", error);
                }
            };

            fetchFavorites();
        }
    }, [user]); // Run effect when the user is authenticated

    const handleSelect = async (movieDetail) => {
        const response = await axios.post('http://localhost:5000/getSelectedMovie', { id: movieDetail.id, title: movieDetail.title });
        console.log("Selected Movie", response.data);
        const movie = response.data;
        navigate('/moviedetail', { state: { movie } });
    };
    const toggleSidebar = () => {
        setSidebarOpen(prevState => !prevState);
    };
    return (
        <div className={styles.favoritesPage}>
            <button className={styles.toggleButton} onClick={toggleSidebar}>
                ☰ {/* You can use a hamburger icon here */}
            </button>

            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
            <div className={styles.favoritesContainer}>
                <h2 className={styles.title}>Favorites</h2>
                {favorites.length > 0 ? (
                    favorites.map((movie, index) => (
                        <div 
                            className={styles.movieCard}
                            key={index}
                            onClick={() => handleSelect(movie)} 
                        >
                            <img className={styles.moviePoster} src={movie.moviePoster} alt={movie.movieTitle} />
                            <div className={styles.movieInfo}>
                                <h3 className={styles.movieTitle}>{movie.title}</h3>
                                <div className={styles.movieRating}>
                                    <span>Rating: {movie.rating}</span>
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
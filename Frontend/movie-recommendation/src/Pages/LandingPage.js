import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from '../Styles/LandingPage.module.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import ClipLoader from 'react-spinners/ClipLoader';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
function LandingPage() {
    const [user] = useAuthState(auth); 
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/movies');
                setMovies(response.data);
                const popularResponse = await axios.get('http://localhost:5000/movies/popular');
                setPopularMovies(popularResponse.data);
                console.log("Popularmovies", popularResponse.data);
                const newReleasesResponse = await axios.get('http://localhost:5000/movies/new-releases');
                setNewReleases(newReleasesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchMovies();
    }, []);
    
    useEffect(() => {
        if (user) {
          const fetchRecommendations = async () => {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            console.log("User",userDoc);
            if (userDoc.exists()) {
              setRecommendedMovies(userDoc.data().recommendations || []);
            }
          };
          fetchRecommendations();
        }
      }, [user]);
      
      // Function to update recommendations in Firestore
      const updateRecommendations = async (newRecommendations) => {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
      
          // Fetch current recommendations from Firestore
          const userDoc = await getDoc(userRef);
          let currentRecommendations = userDoc.exists() ? userDoc.data().recommendations || [] : [];
      
          // Add new recommendations at the start of the array
          currentRecommendations = [...newRecommendations, ...currentRecommendations];
      
          // Limit to 10 recommendations, remove any older ones if the array exceeds 10
          if (currentRecommendations.length > 10) {
            currentRecommendations = currentRecommendations.slice(0, 10);
          }
      
          // Update Firestore with the new recommendations
          await updateDoc(userRef, {
            recommendations: currentRecommendations
          });
      
          // Update local state
          setRecommendedMovies(currentRecommendations);
        }
      };
      
      

    // Load recommended movies from localStorage on component mount
    // useEffect(() => {
    //     const storedRecommendations = localStorage.getItem('recommendedMovies');
    //     if (storedRecommendations) {
    //         setRecommendedMovies(JSON.parse(storedRecommendations));
    //     }
    // }, []);

    // // Listen for changes in localStorage and update recommendedMovies
    // useEffect(() => {
    //     const handleStorageChange = () => {
    //         const storedRecommendations = localStorage.getItem('recommendedMovies');
    //         if (storedRecommendations) {
    //             setRecommendedMovies(JSON.parse(storedRecommendations));
    //         }
    //     };
    //     window.addEventListener('storage', handleStorageChange);
    //     return () => {
    //         window.removeEventListener('storage', handleStorageChange);
    //     };
    // }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query) {
            const suggestions = movies.filter((movie) =>
                movie.title.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredMovies(suggestions);
        } else {
            setFilteredMovies([]);
        }
    };

    const getRecommendations = async (selectedMovie) => {
        try {
            setLoading(true)
            const response = await axios.post('http://localhost:5000/recommend', { movie: selectedMovie });
            console.log("Recommendations:",response.data);
            // Get stored recommendations from localStorage or initialize as empty array if not present
            // const storedRecommendations = JSON.parse(localStorage.getItem('recommendedMovies')) || [];
    
            // // Combine new recommendations with existing ones and remove duplicates using Set
            // const combinedRecommendations = [...new Set([...response.data, ...storedRecommendations])];
    
            // // Limit to a certain number of recommendations, for example, 10
            // const limitedRecommendations = combinedRecommendations.slice(0, 10);

            // setRecommendedMovies(limitedRecommendations);
            // console.log("Recommendation",limitedRecommendations);
            // localStorage.setItem('recommendedMovies', JSON.stringify(limitedRecommendations));
            await updateRecommendations(response.data);
            setLoading(false)
    
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };
    

    const handleSelectedMovie = async (movieDetail) => {
        setLoading(true);
        const response = await axios.post('http://localhost:5000/getSelectedMovie', { id: movieDetail.id, title: movieDetail.title });
        console.log("Selected Movie", response.data);
        const movie = response.data;
        navigate('/moviedetail', { state: { movie } });
        setLoading(false);

    };
    const handleSelectedMovie3 = async (movieDetail) => {
        setLoading(true);
        const response = await axios.post('http://localhost:5000/getSelectedMovie', { id: movieDetail.id, title: movieDetail.title });
        console.log("Selected Movie", response.data);
        const movie = response.data;
        getRecommendations(movie.title); 
        navigate('/moviedetail', { state: { movie } });
        setLoading(false);

    };
    return (
        <div className={style.MainlandingCont}>
            <Sidebar />
            {loading && (
                <div className={style.loaderContainer}>
                    <ClipLoader color="#2AA7FF" size={50} />
                </div>
            )}
            <div className={style.header}>
                {/* Search bar */}
                <div className={style.searchCont}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Type to search for a movie..."
                        className={style.searchBox}
                    />
                    {filteredMovies.length > 0 && (
                        <div className={style.suggestions}>
                            {filteredMovies.map((movie) => (
                                <div
                                    key={movie.id}
                                    className={style.suggestionItem}
                                    onClick={() => handleSelectedMovie3(movie)}
                                >
                                    {movie.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={style.title}>
                    <div style={{ color: 'white', fontSize: '45px', fontFamily: 'Arial', fontWeight: '600' }}>Movies</div>
                    <div style={{ color: 'grey', fontSize: '22px' }}>Explore a world of films perfectly suited to your unique preferences. Our app learns from your choices and delivers movie recommendations that feel just right, every time.</div>
                </div>
            </div>
            <div className={style.landingCont}>
                {recommendedMovies && recommendedMovies.length > 0 && (
                    <div className={style.recommendedSection}>
                        <div className={style.sectionTitle}>Recommended Movies</div>
                        <div className={style.movieRow}>
                            {recommendedMovies.map((movie, index) => (
                                <div
                                    key={index}
                                    className={style.movieCard}
                                    onClick={() => handleSelectedMovie3(movie)}
                                >
                                    <img src={movie.poster_url} alt={movie.title} className={style.moviePoster} />
                                    <h3 className={style.movieTitle}>{movie.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular Movies */}
                <div className={style.sectionTitle}>Popular Movies</div>
                <div className={style.movieRow}>
                    {popularMovies.map((movie, index) => (
                        <div
                            key={index}
                            className={style.movieCard}
                            onClick={() => handleSelectedMovie(movie)}
                        >
                            <img src={movie.poster_url} alt={movie.title} className={style.moviePoster} />
                            <h3 className={style.movieTitle}>{movie.title}</h3>
                        </div>
                    ))}
                </div>

                {/* New Releases */}
                <div className={style.sectionTitle}>New Releases</div>
                <div className={style.movieRow}>
                    {newReleases.map((movie, index) => (
                        <div
                            key={index}
                            className={style.movieCard}
                            onClick={() => handleSelectedMovie(movie)}
                        >
                            <img src={movie.poster_url} alt={movie.title} className={style.moviePoster} />
                            <h3 className={style.movieTitle}>{movie.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LandingPage;

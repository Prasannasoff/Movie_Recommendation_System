import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from '../Styles/LandingPage.module.css';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    console.log(recommendedMovies)
    useEffect(() => {
        const fetchMovies = async () => {

            try {
                const response = await axios.get('http://localhost:5000/movies');
                console.log("HEllo")
                console.log(response.data);
                setMovies(response.data);  // Store entire data
                const popularResponse = await axios.get('http://localhost:5000/movies/popular');
                setPopularMovies(popularResponse.data);

                const newReleasesResponse = await axios.get('http://localhost:5000/movies/new-releases');
                setNewReleases(newReleasesResponse.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        fetchMovies();
    }, []);

    useEffect(() => {
        const storedRecommendations = localStorage.getItem('recommendedMovies');
        if (storedRecommendations) {
            setRecommendedMovies(JSON.parse(storedRecommendations));
        }
    }, []);
    // Listen for changes in localStorage and update recommendedMovies
    useEffect(() => {
        const handleStorageChange = () => {
            const storedRecommendations = localStorage.getItem('recommendedMovies');
            if (storedRecommendations) {
                setRecommendedMovies(JSON.parse(storedRecommendations));
            }
        };

        // Listen for the storage event
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

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
            const response = await axios.post('http://localhost:5000/recommend', { movie: selectedMovie });

            // Retrieve existing recommendations from local storage
            const storedRecommendations = JSON.parse(localStorage.getItem('recommendedMovies')) || [];

            // Combine old recommendations with the new ones, ensuring no duplicates
            const combinedRecommendations = [...new Set([...response.data, ...storedRecommendations,])];

            // Update the recommendedMovies state
            setRecommendedMovies(combinedRecommendations);

            // Store updated recommendations in local storage
            localStorage.setItem('recommendedMovies', JSON.stringify(combinedRecommendations));

        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };


    const handleSelectedMovie = async (movie) => {

        navigate('/moviedetail', { state: { movie } });
        getRecommendations(movie.title);  // Fetch recommendations based on the selected movie
    };
    const handleSelectedMovie2 = async (movieDetail) => {
        const response = await axios.post('http://localhost:5000/getSelectedMovie', { id: movieDetail.id, title: movieDetail.title });
        const movie = response.data;
        console.log(movie)
        navigate('/moviedetail', { state: { movie } });
        getRecommendations(movieDetail.title);  // Fetch recommendations based on the selected movie
    };

    return (
        <div className={style.landingCont}>
            <div className={style.title}>
                <h1 style={{ color: 'white' }}>Movie Recommendation System</h1>
            </div>

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
                                onClick={() => handleSelectedMovie2(movie)}
                            >
                                {movie.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Popular Movies */}
            {recommendedMovies && (
                <div className={style.recommendedSection}>
                    <div className={style.sectionTitle}>Recommended Movies</div>
                    <div className={style.movieRow}>
                        {recommendedMovies.map((movie, index) => (
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
            )}
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

            {/* Display recommended movies */}

        </div>
    );
}

export default LandingPage;

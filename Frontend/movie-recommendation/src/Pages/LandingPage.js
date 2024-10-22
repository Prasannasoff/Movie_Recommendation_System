import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from '../Styles/LandingPage.module.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
function LandingPage() {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [recommendedMovies, setRecommendedMovies] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/movies');
                setMovies(response.data);

                const popularResponse = await axios.get('http://localhost:5000/movies/popular');
                setPopularMovies(popularResponse.data);
                console.log("Popularmovies",popularResponse.data);
                const newReleasesResponse = await axios.get('http://localhost:5000/movies/new-releases');
                setNewReleases(newReleasesResponse.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchMovies();
    }, []);

    // Load recommended movies from localStorage on component mount
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

            const storedRecommendations = JSON.parse(localStorage.getItem('recommendedMovies')) || [];


            const combinedRecommendations = [...new Set([...response.data, ...storedRecommendations])];

            const limitedRecommendations = combinedRecommendations.slice(0, 10);

            setRecommendedMovies(limitedRecommendations);
            localStorage.setItem('recommendedMovies', JSON.stringify(limitedRecommendations));

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
        navigate('/moviedetail', { state: { movie } });
        getRecommendations(movieDetail.title);  // Fetch recommendations based on the selected movie
    };

    return (
        <div className={style.MainlandingCont}>
            <Sidebar />
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
                                    onClick={() => handleSelectedMovie2(movie)}
                                >
                                    {movie.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={style.title}>
                    <div style={{ color: 'white',fontSize:'45px',fontFamily:'Arial',fontWeight:'600' }}>Movies</div>
                    <div style={{color:'grey',fontSize:'22px'}}>When Tony Stark's world is torn apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.</div>
                </div>
            </div>
            <div className={style.landingCont}>
                {/* Recommended Movies */}
                {recommendedMovies && recommendedMovies.length > 0 && (
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

import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import style from '../Styles/LandingPage.module.css';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // searchTerm replaces selectedMovie
    const [filteredMovies, setFilteredMovies] = useState([]); // Auto-suggested movies based on searchTerm
    const [recommendedMovies, setRecommendedMovies] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/movies');
                setMovies(response.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        fetchMovies();
    }, []);

    // Function to handle search input and filter movies
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
            setRecommendedMovies(response.data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const handleMovieClick = (movie) => {
        setSearchTerm(movie.title); // Set clicked movie title to the input
        setFilteredMovies([]); // Clear the suggestions
        getRecommendations(movie.title); // Fetch recommendations for the selected movie
    };

    const handleSelectedMovie = (movie) => {
        navigate('/moviedetail', { state: { movie } });
    };

    return (
        <div className={style.landingCont}>
            <div className={style.title}>
                <h1 style={{ color: 'white' }}>Movie Recommendation System</h1>
            </div>

            <div className={style.searchCont}>
                <div>
                    <i className="fa fa-search search-icon"></i>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Type to search for a movie..."
                        className={style.searchBox}
                    />
                    {/* Display auto-suggestions */}
                    {filteredMovies.length > 0 && (
                        <div className={style.suggestions}>
                            {filteredMovies.map((movie) => (
                                <div
                                    key={movie.id}
                                    className={style.suggestionItem}
                                    onClick={() => handleMovieClick(movie)}
                                >
                                    {movie.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recommend button */}
            <div onClick={() => getRecommendations(searchTerm)} className={style.recommendBtn}>
                Recommend Movies!
            </div>

            {/* Display recommended movies */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
                {recommendedMovies.map((movie, index) => (
                    <div
                        key={index}
                        className={style.movieCard}
                        style={{ textAlign: 'center', width: '200px', backgroundColor: '#222', padding: '10px', borderRadius: '10px' }}
                        onClick={() => handleSelectedMovie(movie)}
                    >
                        <h3 style={{ color: 'white', fontSize: '18px' }}>{movie.title}</h3>
                        <img src={movie.poster} alt={movie.title} width="150" style={{ borderRadius: '10px' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LandingPage;

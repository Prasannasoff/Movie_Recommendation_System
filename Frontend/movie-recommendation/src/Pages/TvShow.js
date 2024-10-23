import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from '../Styles/TvShow.module.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
function TvShow() {
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
                const response = await axios.get('http://localhost:5000/getAllShows');
                setMovies(response.data);
                console.log("Tv SHhow", response.data);
                const popularResponse = await axios.get('http://localhost:5000/getPopularShows');
                setPopularMovies(popularResponse.data);
                console.log("Popular Show", popularResponse.data)
                const newReleasesResponse = await axios.get('http://localhost:5000/getNewShows');
                setNewReleases(newReleasesResponse.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchMovies();
    }, []);


    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query) {
            const suggestions = movies.filter((movie) =>
                movie.name.toLowerCase().includes(query.toLowerCase())
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

    const handleSelectedMovie = async (seriesDetail) => {
        navigate('/seriesdetail', { state: { seriesDetail } });

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
                            {filteredMovies.map((series) => (
                                <div
                                    key={series.id}
                                    className={style.suggestionItem}
                                    onClick={() => handleSelectedMovie(series)}
                                >
                                    {series.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={style.title}>
                    <div style={{ color: 'white', fontSize: '45px', fontFamily: 'Arial', fontWeight: '600' }}>Tv Shows</div>
                    <div style={{ color: 'grey', fontSize: '22px' }}>When Tony Stark's world is torn apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.</div>
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
                    {popularMovies.map((series, index) => (
                        <div
                            key={index}
                            className={style.movieCard}
                            onClick={() => handleSelectedMovie(series)}
                        >


                            <img src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} alt={series.name} className={style.moviePoster} />

                            <h3 className={style.movieTitle}>{series.name}</h3>
                        </div>
                    ))}
                </div>

                {/* New Releases */}
                <div className={style.sectionTitle}>New Releases</div>
                <div className={style.movieRow}>
                    {newReleases.map((series, index) => (
                        <div
                            key={index}
                            className={style.movieCard}
                            onClick={() => handleSelectedMovie(series)}
                        >
                            <img src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} alt={series.name} className={style.moviePoster} />
                            <h3 className={style.movieTitle}>{series.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TvShow;

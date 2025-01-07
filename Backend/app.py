import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pandas as pd
from dotenv import load_dotenv
import pickle as pk
import tempfile
from urllib.request import urlopen
import gdown

load_dotenv()

# Cache for storing loaded data
_cache = {
    'dfs': None,
    'similarity': None,
    'df': None
}
def fetch_movie_details(movie_id):
    api_url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}'
    response = requests.get(api_url)
    data = response.json()

    poster_url = "https://image.tmdb.org/t/p/w500/" + data.get('poster_path', '')
    description = data.get('overview', 'No description available')
    rating = data.get('vote_average', 'No rating available')
    genres = [genre['name'] for genre in data.get('genres', [])]
    release_date = data.get('release_date', 'No release date available')
    runtime = data.get('runtime', 'No runtime available')
    tagline = data.get('tagline', 'No tagline available')
    language = data.get('original_language', 'No language available')
    spoken_languages = [language['name'] for language in data.get('spoken_languages', [])]
    budget = data.get('budget', 'No budget available')
    status = data.get('status', 'No status available')

    trailer_url = f'https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key={API_KEY}'
    video_response = requests.get(trailer_url, timeout=10)
    video_data = video_response.json()

    trailers = [video for video in video_data.get('results', []) if video['site'] == 'YouTube' and video['type'] == 'Trailer']
    trailer_key = trailers[0]['key'] if trailers else None
    trailer_link = f'https://www.youtube.com/watch?v={trailer_key}' if trailer_key else 'Trailer not available'

    credits_url = f'https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={API_KEY}'
    credits_response = requests.get(credits_url, timeout=10)
    credits_data = credits_response.json()

    cast = credits_data.get('cast', [])
    director = next((member['name'] for member in credits_data.get('crew', []) if member['job'] == 'Director'), 'No director available')
    writers = [member['name'] for member in credits_data.get('crew', []) if member['job'] in ['Screenplay', 'Writer', 'Story']]

    leading_actors = [actor['name'] for actor in cast if actor['order'] < 2]
    hero = leading_actors[0] if len(leading_actors) > 0 else 'No hero available'
    heroine = leading_actors[1] if len(leading_actors) > 1 else 'No heroine available'

    return {
        'poster_url': poster_url,
        'description': description,
        'rating': rating,
        'release_date': release_date,
        'spoken_languages': spoken_languages,
        'runtime': runtime,
        'genres': genres,
        'tagline': tagline,
        'language': language,
        'budget': budget,
        'status': status,
        'trailer': trailer_link,
        'director': director,
        'hero': hero,
        'heroine': heroine,
        'writers': writers
    }

def get_direct_download_url(share_url):
    """Convert Google Drive sharing URL to direct download URL"""
    # Extract file ID from sharing URL
    file_id = share_url.split('/d/')[1].split('/view')[0]
    return f"https://drive.google.com/uc?id={file_id}"

def load_pickle_from_drive():
    """Load pickle files from Google Drive and cache them"""
    if all(_cache.values()):  # If cache is populated, return
        return

    # Replace these with your Google Drive sharing URLs
    movielist_share_url = movielist_file_url
    similarity_share_url = similarity_file_url

    if not _cache['dfs']:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp_path = tmp.name
        try:
            # Download the file
            gdown.download(get_direct_download_url(movielist_share_url), tmp_path, quiet=False)
            # Load the pickle file
            with open(tmp_path, 'rb') as f:
                _cache['dfs'] = pk.load(f)
        finally:
            # Ensure file cleanup
            os.unlink(tmp_path)

    if not _cache['similarity']:
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp_path = tmp.name
        try:
            # Download the file
            gdown.download(get_direct_download_url(similarity_share_url), tmp_path, quiet=False)
            # Load the pickle file
            with open(tmp_path, 'rb') as f:
                _cache['similarity'] = pk.load(f)
        finally:
            # Ensure file cleanup
            os.unlink(tmp_path)

    _cache['df'] = pd.DataFrame(_cache['dfs'])


def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Load data when creating the app
    load_pickle_from_drive()
    
    # Your route definitions here
    @app.route('/movies/popular', methods=['GET'])
    def get_popular_movies():
        api_url = f'https://api.themoviedb.org/3/movie/top_rated?api_key={API_KEY}&language=en-US&page=1'
        response = requests.get(api_url)
        data = response.json()

        if response.status_code != 200 or 'results' not in data:
            return jsonify({'error': 'Failed to fetch popular movies'}), 500

        movies = []
        for movie in data['results'][:10]:
            movie_id = movie.get('id')
            movie_title = movie.get('title')
            movies.append({
                'id': movie_id,
                'title': movie_title,
                'poster_url': f"https://image.tmdb.org/t/p/w500/{movie.get('poster_path')}" if movie.get('poster_path') else None,
            })

        return jsonify(movies)

    @app.route('/movies', methods=['GET'])
    def get_movies():
        if not _cache['df'] is not None:
            load_pickle_from_drive()
        movie_list = _cache['df'][['id', 'title']].to_dict(orient='records')
        return jsonify(movie_list)

    @app.route('/recommend', methods=['POST'])
    def recommend():
        if any(v is None for v in _cache.values()):
            load_pickle_from_drive()
            
        movie = request.json.get('movie')
        recommended_movies = []

        index = _cache['df'][_cache['df']['title'] == movie].index[0]
        distances = sorted(list(enumerate(_cache['similarity'][index])), reverse=True, key=lambda x: x[1])

        for i in distances[1:6]:
            movie_title = _cache['df'].iloc[i[0]]['title']
            movie_id = _cache['df'].iloc[i[0]]['id']
            tmdb_url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}&language=en-US"
            response = requests.get(tmdb_url)

            if response.status_code == 200:
                movie_details = response.json()
                poster_path = movie_details.get('poster_path', None)

                recommended_movies.append({
                    'title': movie_title,
                    'id': int(movie_id),
                    'poster_url': f"https://image.tmdb.org/t/p/w500/{poster_path}" if poster_path else None
                })
            else:
                print(f"Failed to fetch details for movie ID {movie_id}")

        return jsonify(recommended_movies)




    @app.route('/movies/new-releases', methods=['GET'])
    def get_new_releases():
        api_url = f'https://api.themoviedb.org/3/movie/now_playing?api_key={API_KEY}&language=en-US&page=1'
        response = requests.get(api_url, timeout=10)
        data = response.json()

        if response.status_code != 200 or 'results' not in data:
            return jsonify({'error': 'Failed to fetch new releases'}), 500

        movies = []
        for movie in data['results'][:10]:
            movie_id = movie.get('id')
            movie_title = movie.get('title')
            movies.append({
                'id': movie_id,
                'title': movie_title,
                'poster_url': f"https://image.tmdb.org/t/p/w500/{movie.get('poster_path')}" if movie.get('poster_path') else None,
            })

        return jsonify(movies)



    @app.route('/getSelectedMovie', methods=['POST'])
    def getSelectedMovie():
        movieId = request.json.get('id')
        movieTitle = request.json.get('title')
        movie_details = fetch_movie_details(movieId)
        movie_details['id'] = movieId
        movie_details['title'] = movieTitle
        return jsonify(movie_details)



    @app.route('/getAllShows', methods=['GET'])
    def fetch_tv_shows():
        endpoints = [
            'https://api.themoviedb.org/3/tv/popular',
            'https://api.themoviedb.org/3/tv/top_rated',
            'https://api.themoviedb.org/3/tv/airing_today',
            'https://api.themoviedb.org/3/tv/on_the_air'
        ]
        
        all_tv_shows = []
        for url in endpoints:
            response = requests.get(f'{url}?api_key={API_KEY}&language=en-US&page=1')
            if response.status_code == 200:
                all_tv_shows.extend(response.json()['results'])
            else:
                print(f'Error fetching from {url}: {response.status_code}')
        return jsonify(all_tv_shows)

    @app.route('/getPopularShows', methods=['GET'])
    def fetch_popular_shows():
        response = requests.get(f'https://api.themoviedb.org/3/tv/top_rated?api_key={API_KEY}&language=en-US&page=1')
        return jsonify(response.json()['results'])

    @app.route('/getNewShows', methods=['GET'])
    def fetch_new_shows():
        response = requests.get(f'https://api.themoviedb.org/3/tv/on_the_air?api_key={API_KEY}&language=en-US&page=1')
        return jsonify(response.json()['results'])
    return app
app = create_app()
API_KEY = os.getenv('TMDB_API_KEY')
similarity_file_url=os.getenv('SIMILARITY_URL')
movielist_file_url=os.getenv('MOVIELIST_URL')

if __name__ == "__main__":
    app.run(debug=True)
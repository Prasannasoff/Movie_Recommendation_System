import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pickle as pk
import pandas as pd
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
API_KEY = os.getenv('TMDB_API_KEY')
dfs = pk.load(open("movielist.pkl", "rb"))
similarity = pk.load(open("similarity.pkl", "rb"))
df = pd.DataFrame(dfs)

def fetch_movie_details(movie_id):
    api_url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}'
    response = requests.get(api_url, timeout=10)
    data = response.json()
    # Fetch poster, overview, rating, release date
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

    # Fetch the trailer from TMDB API
    trailer_url = f'https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key={API_KEY}'
    video_response = requests.get(trailer_url, timeout=10)
    video_data = video_response.json()
    
    # Find YouTube trailer
    trailers = [video for video in video_data.get('results', []) if video['site'] == 'YouTube' and video['type'] == 'Trailer']
    trailer_key = trailers[0]['key'] if trailers else None
    trailer_link = f'https://www.youtube.com/watch?v={trailer_key}' if trailer_key else 'Trailer not available'

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
        'trailer': trailer_link
    }
@app.route('/movies/popular', methods=['GET'])
def get_popular_movies():
    api_url = f'https://api.themoviedb.org/3/movie/popular?api_key={API_KEY}&language=en-US&page=1'  # Fetch popular movies
    response = requests.get(api_url, timeout=10)
    data = response.json()

    # Check if the request was successful
    if response.status_code != 200 or 'results' not in data:
        return jsonify({'error': 'Failed to fetch popular movies'}), 500

    # Extract movie details and limit to top 10
    movies = []
    for movie in data['results'][:10]:  # Top 10 popular movies
        movies.append({
            'id': movie.get('id'),
            'title': movie.get('title'),
            'poster_url': f"https://image.tmdb.org/t/p/w500/{movie.get('poster_path')}" if movie.get('poster_path') else None,
            'description': movie.get('overview'),
            'rating': movie.get('vote_average'),
            'release_date': movie.get('release_date'),
            'genres' : [genre['name'] for genre in data.get('genres', [])]

        })

    return jsonify(movies)

@app.route('/movies/new-releases', methods=['GET'])
def get_new_releases():
    api_url = f'https://api.themoviedb.org/3/movie/now_playing?api_key={API_KEY}&language=en-US&page=1'  # Fetch new releases
    response = requests.get(api_url, timeout=10)
    data = response.json()

    # Check if the request was successful
    if response.status_code != 200 or 'results' not in data:
        return jsonify({'error': 'Failed to fetch new releases'}), 500

    # Extract movie details and limit to top 10
    movies = []
    for movie in data['results'][:10]:  # Top 10 new releases
        movies.append({
            'id': movie.get('id'),
            'title': movie.get('title'),
            'poster_url': f"https://image.tmdb.org/t/p/w500/{movie.get('poster_path')}" if movie.get('poster_path') else None,
            'description': movie.get('overview'),
            'rating': movie.get('vote_average'),
            'release_date': movie.get('release_date'),
            'genres' : [genre['name'] for genre in data.get('genres', [])]

        })

    return jsonify(movies)
@app.route('/movies', methods=['GET'])
def get_movies():
    # Return movie ids and titles
    movie_list = df[['id', 'title']].to_dict(orient='records')
    return jsonify(movie_list)

@app.route('/getSelectedMovie',methods=['POST'])
def getSelectedMovie():
    movieId = request.json.get('id')
    movieTitle = request.json.get('title')
    movie_details=fetch_movie_details(movieId)
    movie_details['title'] = movieTitle 
    print(movie_details)
    return jsonify(movie_details)

@app.route('/recommend', methods=['POST'])
def recommend():
    movie = request.json.get('movie')
    recommended_movies = []

    index = df[df['title'] == movie].index[0]
    distances = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda x: x[1])

    for i in distances[1:6]:  # Top 5 recommendations
        movie_title = df.iloc[i[0]].title
        movie_id = df.iloc[i[0]].id
        movie_details = fetch_movie_details(movie_id)

        recommended_movies.append({
            'title': movie_title,
            'poster_url': movie_details['poster_url'],
            'description': movie_details['description'],
            'rating': movie_details['rating'],
            'release_date': movie_details['release_date'],
            'genres': movie_details['genres'],
            'runtime': movie_details['runtime'],
            'tagline': movie_details['tagline'],
            'spoken_languages': movie_details['spoken_languages'],
            'budget': movie_details['budget'],
            'status': movie_details['status'],
            'trailer': movie_details['trailer']
        })

    return jsonify(recommended_movies)

if __name__ == "__main__":
    app.run(debug=True)
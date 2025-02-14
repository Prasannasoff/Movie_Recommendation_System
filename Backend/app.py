import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pickle as pk
import pandas as pd
from dotenv import load_dotenv
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv('TMDB_API_KEY')

# Load and preprocess dataset

load_dotenv()

app = Flask(__name__)

CORS(app)
API_KEY = os.getenv('TMDB_API_KEY')
dfs = pk.load(open("movielist.pkl", "rb"))

df = pd.DataFrame(dfs)
# Load and preprocess dataset
movie_df = pd.read_csv('dataset.csv')

# Handle missing values
movie_df = movie_df.fillna("")

# Combine necessary text data
movie_df['tag'] = movie_df['overview'] + " " + movie_df['genre']

# Keep required columns
movie_df = movie_df[['id', 'title', 'tag']]

# Vectorize text data
cv = CountVectorizer(max_features=10000, stop_words="english")
vector = cv.fit_transform(movie_df['tag'].values.astype('U')).toarray()

# Compute similarity matrix
similarity_matrix = cosine_similarity(vector)
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
        'writers':writers
    }

@app.route('/movies/popular', methods=['GET'])
def get_popular_movies():
    api_url = f'https://api.themoviedb.org/3/movie/top_rated?api_key={API_KEY}&language=en-US&page=1'  # Fetch popular movies
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

@app.route('/movies/new-releases', methods=['GET'])
def get_new_releases():
    api_url = f'https://api.themoviedb.org/3/movie/now_playing?api_key={API_KEY}&language=en-US&page=1'  # Fetch new releases
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
@app.route('/movies', methods=['GET'])
def get_movies():

    movie_list = df[['id', 'title']].to_dict(orient='records')
    return jsonify(movie_list)

@app.route('/getSelectedMovie',methods=['POST'])
def getSelectedMovie():
    movieId = request.json.get('id')
    movieTitle = request.json.get('title')
    print(movieTitle)
    movie_details=fetch_movie_details(movieId)
    movie_details['id']=movieId
    movie_details['title'] = movieTitle 
    return jsonify(movie_details)

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        if not data or 'movie' not in data:
            return jsonify({'error': 'Invalid request. Please provide a movie name.'}), 400

        movie = data['movie']
        print(f"Received recommendation request for: {movie}")

        # Check if movie exists in dataset
        if movie not in movie_df['title'].values:
            print(f"Movie '{movie}' not found in dataset.")
            return jsonify({'error': f'Movie "{movie}" not found in dataset'}), 404

        # Get the index of the movie
        index = movie_df[movie_df['title'] == movie].index
        if index.empty:
            print(f"Could not find index for movie '{movie}'")
            return jsonify({'error': f'Could not find index for movie "{movie}"'}), 404

        index = index[0]
        print(f"Movie '{movie}' found at index {index}")

        # Ensure similarity_matrix is valid
        if index >= len(similarity_matrix):
            print(f"Index {index} is out of range for similarity_matrix of shape {len(similarity_matrix)}")
            return jsonify({'error': 'Similarity matrix index out of range'}), 500

        distances = sorted(enumerate(similarity_matrix[index]), key=lambda x: x[1], reverse=True)
        recommended_movies = []

        for i in distances[1:6]: 
            recommended_index = i[0]
            movie_id = int(movie_df.iloc[recommended_index]['id']) 
            movie_title = movie_df.iloc[recommended_index]['title']
            print(f"Recommended: {movie_title} (ID: {movie_id})")

            movie_details = fetch_movie_details(movie_id)
            movie_details['id'] = movie_id 
            movie_details['title'] = movie_title
            recommended_movies.append(movie_details)

        return jsonify(recommended_movies)

    except Exception as e:
        print(f"Error in recommend function: {e}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500




endpoints = [
    'https://api.themoviedb.org/3/tv/popular',
    'https://api.themoviedb.org/3/tv/top_rated',
    'https://api.themoviedb.org/3/tv/airing_today',
    'https://api.themoviedb.org/3/tv/on_the_air'
]
@app.route('/getAllShows',methods=['GET'])
def fetch_tv_shows():
    all_tv_shows = []
    for url in endpoints:
        response = requests.get(f'{url}?api_key={API_KEY}&language=en-US&page=1')
        if response.status_code == 200:
            all_tv_shows.extend(response.json()['results'])
        else:
            print(f'Error fetching from {url}: {response.status_code}')
    return jsonify(all_tv_shows)

@app.route('/getPopularShows',methods=['GET'])
def fetch_popular_shows():
    response=requests.get(f'https://api.themoviedb.org/3/tv/top_rated?api_key={API_KEY}&language=en-US&page=1')
    return (response.json()['results'])

@app.route('/getNewShows',methods=['GET'])
def fetch_new_shows():
    response=requests.get(f'https://api.themoviedb.org/3/tv/on_the_air?api_key={API_KEY}&language=en-US&page=1')
    return (response.json()['results'])
if __name__ == "__main__":
    app.run(debug=True)
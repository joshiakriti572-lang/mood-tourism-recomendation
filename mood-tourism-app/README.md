# Mood Tourism Nepal

Mood Tourism Nepal is a WebGIS-based tourism recommendation system that helps users discover tourism places in Nepal based on mood, current location, and search radius.

## Project Theme
Tourism and geospatial technology

## Study Area
Nepal

## Purpose
The purpose of this project is to support tourism decision-making by recommending nearby places based on user mood and radius.

## Tourism Problem Addressed
Tourists may face difficulty choosing suitable places based on interest, mood, distance, and accessibility. This project helps users find tourism places according to their selected mood and nearby location.

## Technology Stack
- Frontend: HTML, CSS, JavaScript, Leaflet
- Backend: FastAPI
- Database: PostgreSQL
- Data: OpenStreetMap-derived tourism data and GeoJSON boundary layers

## Main Features
- Mood-based tourism recommendation
- User geolocation
- Radius-based filtering
- Distance estimation
- Travel time estimation
- Route visualization
- Three basemaps: OpenStreetMap, Topographic Map, Satellite Map
- Three overlays: Province, District, Local Level boundaries
- Interactive popups
- Search result cards
- Responsive frontend design

## Three-Tier Architecture
### Frontend Layer
The frontend is built using HTML, CSS, JavaScript, and Leaflet. It displays the map, basemaps, overlays, markers, routes, popups, and user interface.

### Backend Layer
The backend is built using FastAPI. It handles API requests, fetches tourism data from PostgreSQL, calculates distance, filters places by radius and mood, and returns JSON data.

### Data Layer
The data layer uses PostgreSQL for tourism place records and GeoJSON files for province, district, and local level boundary layers.


So the complete part should look exactly like this:

## How To Run
1. Start PostgreSQL and make sure the database `mood_tourism_db` exists.
2. Open terminal inside the `backend` folder.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run backend:
   ```bash
   uvicorn main:app --reload
   ```
5. Open `frontend/index.html` using VS Code Live Server.

## Author
Akriti Joshi
Geospatial Mini-Project on Tourism
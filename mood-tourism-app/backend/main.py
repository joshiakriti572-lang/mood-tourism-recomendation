from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import psycopg2
import math

app = FastAPI()

# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= DATABASE CONNECTION =================

conn = psycopg2.connect(
    host="localhost",
    database="mood_tourism_db",
    user="postgres",
    password="postgres123"
)

cursor = conn.cursor()

# ================= ROOT =================

@app.get("/")
def home():

    return {
        "message":
        "Mood Tourism Backend Connected Successfully"
    }

# ================= DISTANCE FUNCTION =================

def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371

    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    a = (
        math.sin(dLat / 2) ** 2
        +
        math.cos(math.radians(lat1))
        *
        math.cos(math.radians(lat2))
        *
        math.sin(dLon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return R * c

# ================= LIVE PLACES API =================

@app.get("/live_places")
def get_live_places(

    lat: float,
    lng: float,
    mood: str,
    radius: int = 20

):

    try:

        # ================= GET PLACES =================

        query = """

        SELECT
            id,
            name,
            mood,
            description,
            latitude,
            longitude,
            vehicle,
            rating,
            opening_hours

        FROM places

        WHERE mood = %s

        """

        cursor.execute(query, (mood,))

        results = cursor.fetchall()

        places = []

        # ================= FILTER NEARBY =================

        for row in results:

            place_id = row[0]
            name = row[1]
            place_mood = row[2]
            description = row[3]
            latitude = row[4]
            longitude = row[5]
            vehicle = row[6]
            rating = row[7]
            opening_hours = row[8]

            distance = calculate_distance(

                lat,
                lng,
                latitude,
                longitude

            )

            # ================= RADIUS FILTER =================

            if distance <= radius:

                travel_time = round(
                    (distance / 30) * 60,
                    1
                )

                places.append({

                    "id": place_id,

                    "name": name,

                    "mood": place_mood,

                    "description": description,

                    "latitude": latitude,

                    "longitude": longitude,

                    "vehicle": vehicle,

                    "rating": rating,

                    "opening_hours": opening_hours,

                    "distance":
                        f"{round(distance,2)} km",

                    "travel_time":
                        f"{travel_time} mins"

                })

        # ================= SORT BY DISTANCE =================

        places = sorted(

            places,

            key=lambda x:
            float(
                x["distance"]
                .replace(" km", "")
            )

        )

        # ================= SAVE SEARCH HISTORY =================

        cursor.execute("""

        INSERT INTO search_history
        (mood, radius, latitude, longitude)

        VALUES (%s, %s, %s, %s)

        """, (

            mood,
            radius,
            lat,
            lng

        ))

        conn.commit()

        # ================= RETURN DATA =================

        return places

    except Exception as e:

        return {
            "error": str(e)
        }
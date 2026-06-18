import csv

input_file = "NP.txt"

output_file = "nepal_tourism_places.csv"

# Tourism related keywords
tourism_keywords = [

    "temple",
    "monastery",
    "lake",
    "park",
    "mountain",
    "museum",
    "waterfall",
    "viewpoint",
    "trek",
    "hill",
    "stupa",
    "palace",
    "cave",
    "resort",
    "camp"

]

places = []

with open(input_file, "r", encoding="utf-8") as file:

    for line in file:

        data = line.strip().split("\t")

        if len(data) < 6:
            continue

        name = data[1]

        latitude = data[4]

        longitude = data[5]

        lower_name = name.lower()

        # Filter tourism related names
        if any(keyword in lower_name for keyword in tourism_keywords):

            mood = "Happy"

            if "temple" in lower_name or \
               "monastery" in lower_name or \
               "stupa" in lower_name:

                mood = "Spiritual"

            elif "lake" in lower_name or \
                 "park" in lower_name or \
                 "hill" in lower_name:

                mood = "Calm"

            elif "mountain" in lower_name or \
                 "trek" in lower_name or \
                 "camp" in lower_name:

                mood = "Adventure"

            elif "resort" in lower_name:

                mood = "Romantic"

            places.append([

                name,
                mood,
                f"Popular {mood.lower()} tourist destination in Nepal.",
                latitude,
                longitude,
                "Walk/Taxi/Car",
                "4.5",
                "24 Hours"

            ])

# Write CSV
with open(output_file, "w", newline="", encoding="utf-8") as csvfile:

    writer = csv.writer(csvfile)

    writer.writerow([

        "name",
        "mood",
        "description",
        "latitude",
        "longitude",
        "vehicle",
        "rating",
        "opening_hours"

    ])

    writer.writerows(places)

print(f"CSV created with {len(places)} places")
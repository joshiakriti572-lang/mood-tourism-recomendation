// ================= MAP =================

const map = L.map('map', {
    fullscreenControl: true
}).setView([27.7172, 85.3240], 12);

// ================= TILE LAYER =================

// ================= BASE MAPS =================

const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: 'OpenStreetMap'
    }
);

const topo = L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    {
        attribution: 'OpenTopoMap'
    }
);

const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Esri Satellite'
    }
);

// Default map
osm.addTo(map);
// ================= LAYER CONTROL =================

const baseMaps = {
    "OpenStreetMap": osm,
    "Topographic Map": topo,
    "Satellite Map": satellite
};
// ================= OVERLAY LAYERS =================

let provinceLayer;
let districtLayer;
let municipalityLayer;

// Province

fetch("province.geojson")
.then(response => response.json())
.then(data => {

    provinceLayer = L.geoJSON(data, {
        style: {
            color: "red",
            weight: 3,
            fillOpacity: 0
        }
    });

    provinceLayer.addTo(map);

});

// District

fetch("nepal-districts.json")
.then(response => response.json())
.then(data => {

    districtLayer = L.geoJSON(data, {
        style: {
            color: "blue",
            weight: 2,
            fillOpacity: 0
        }
    });

});

// Municipality

fetch("nepal-municipalities.json")
.then(response => response.json())
.then(data => {

    municipalityLayer = L.geoJSON(data, {
        style: {
            color: "green",
            weight: 1,
            fillOpacity: 0
        }
    });

});
//****************************************************************************
setTimeout(() => {

    const overlayMaps = {

        "Province Boundary": provinceLayer,

        "District Boundary": districtLayer,

        "Local Level Boundary": municipalityLayer

    };

    L.control.layers(
        baseMaps,
        overlayMaps
    ).addTo(map);

}, 2000);

// FIX MAP SIZE AFTER INTRO

setTimeout(() => {
    map.invalidateSize();
}, 7500);

// ================= VARIABLES =================

let userLat = 27.7172;
let userLng = 85.3240;

let markers = [];
let routes = [];

// ================= USER ICON =================

const userIcon = L.divIcon({
    className: "userLocationMarker",
    html: `
        <div class="userPulse">
            <div class="userDot"></div>
        </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -12]
});
// ================= MOOD ICONS =================

function createMoodIcon(mood) {
    const moodLetters = {
        Happy: "H",
        Adventure: "A",
        Spiritual: "S",
        Romantic: "R",
        Calm: "C"
    };

    const moodClasses = {
        Happy: "happyMarker",
        Adventure: "adventureMarker",
        Spiritual: "spiritualMarker",
        Romantic: "romanticMarker",
        Calm: "calmMarker"
    };

    return L.divIcon({
        className: `moodMarker ${moodClasses[mood] || "happyMarker"}`,
        html: `
            <div class="moodMarkerInner">
                <span>${moodLetters[mood] || "T"}</span>
            </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -38]
    });
}
// ================= USER LOCATION =================

navigator.geolocation.getCurrentPosition(

    (position) => {

        userLat = position.coords.latitude;
        userLng = position.coords.longitude;

        map.setView([userLat, userLng], 13);

        const userMarker = L.marker(
    [userLat, userLng],
    { icon: userIcon }
).addTo(map)
.bindTooltip("You are here", {
    permanent: true,
    direction: "top",
    offset: [0, -14],
    className: "userTooltip"
});

       userMarker.bindPopup(`

    <div class="userSimplePopup">

        <h3>Your Location</h3>

        <p>You are currently here.</p>

        <div class="userCoordBox">
            <span>Lat: ${userLat.toFixed(5)}</span>
            <span>Lng: ${userLng.toFixed(5)}</span>
        </div>

    </div>

`);
    },

    (error) => {

        alert("Location access denied");

    }

);

// ================= RADIUS SLIDER =================

const radiusSlider =
    document.getElementById("radiusSlider");

const radiusValue =
    document.getElementById("radiusValue");

radiusSlider.addEventListener("input", () => {

    radiusValue.innerText =
        radiusSlider.value + " km";

});

// ================= SEARCH BUTTON =================

async function showPlaces() {

    // CLEAR OLD MARKERS

    markers.forEach(marker => {
        map.removeLayer(marker);
    });

    routes.forEach(route => {
        map.removeControl(route);
    });

    markers = [];
    routes = [];

    const mood =
        document.getElementById("moodSelect").value;

    const radius =
        document.getElementById("radiusSlider").value;

    try {

        const response = await fetch(

            `http://127.0.0.1:8000/live_places?lat=${userLat}&lng=${userLng}&mood=${mood}&radius=${radius}`

        );

        const places = await response.json();
        const resultsContainer = document.getElementById("resultsContainer");

resultsContainer.innerHTML = `
    <div class="resultsIntro">
        <h3>${places.length} Places Found</h3>
        <p>Recommended places based on your selected mood.</p>
    </div>
`;

       places.forEach((place, index) => {
        const times = estimateTravelTimes(place.distance);
   
            const marker = L.marker(

                [
                    place.latitude,
                    place.longitude
                ],

                {
                   icon: createMoodIcon(place.mood)
                }

            ).addTo(map);

            marker.bindPopup(`

    <div class="simplePopup">

        <h3>
            ${getMoodEmoji(place.mood)} ${place.name}
        </h3>

        <p>
            ${place.mood} tourism place
        </p>

        <div class="popupMeta">
            <span>📍 ${place.distance}</span>
            <span>⭐ ${place.rating}</span>
        </div>

      <button onclick="
    const popup = this.closest('.simplePopup');
    popup.classList.toggle('showDetails');
    this.innerText = popup.classList.contains('showDetails') ? 'Hide Details' : 'View Details';
">
    View Details
</button>

<div class="popupDetails">
   <p><b>Walking:</b> ${times.walk} mins</p>
<p><b>Taxi:</b> ${times.taxi} mins</p>
<p><b>Car:</b> ${times.car} mins</p>
    <p><b>Opening Hours:</b> ${place.opening_hours}</p>
    <p><b>Travel Mode:</b> Walk / Taxi / Car</p>
    <p><b>Description:</b> ${place.description}</p>
</div>

    </div>

`);
            markers.push(marker);
            const card = document.createElement("div");
card.className = "placeCard";

card.innerHTML = `
    <div class="placeNumber">${index + 1}</div>

    <div class="placeInfo">
        <h3>${getMoodEmoji(place.mood)} ${place.name}</h3>
        <p>${place.mood} tourism place</p>
    </div>

    <button class="viewPlaceBtn">Map</button>
`;

card.addEventListener("click", () => {
    map.setView([place.latitude, place.longitude], 15);
    marker.openPopup();
});

resultsContainer.appendChild(card);

            // ================= ROUTE =================

            if (
                document
                .getElementById("routeToggle")
                .checked
            ) {

                const route =
                    L.Routing.control({

                        waypoints: [

                            L.latLng(
                                userLat,
                                userLng
                            ),

                            L.latLng(
                                place.latitude,
                                place.longitude
                            )

                        ],

                        routeWhileDragging: false,

                        draggableWaypoints: false,

                        addWaypoints: false,

                        fitSelectedRoutes: false,

                        show: false,

                        createMarker: function () {
                            return null;
                        },

                        lineOptions: {

                            styles: [
                                {
                                    color: '#2563eb',
                                    opacity: 0.75,
                                    weight: 5
                                }
                            ]

                        }

                    }).addTo(map);

                routes.push(route);

            }

        });

    }

    catch (error) {

        console.log(error);

        alert("Error loading places");

    }

}
function estimateTravelTimes(distanceText) {
    const distance = parseFloat(distanceText.replace(" km", ""));

    const walkTime = Math.round((distance / 5) * 60);
    const taxiTime = Math.round((distance / 25) * 60);
    const carTime = Math.round((distance / 35) * 60);

    return {
        walk: walkTime,
        taxi: taxiTime,
        car: carTime
    };
}
// ================= MOOD EMOJIS =================

function getMoodEmoji(mood) {

    if (mood === "Happy") {
        return "😄";
    }

    if (mood === "Adventure") {
        return "🏔️";
    }

    if (mood === "Spiritual") {
        return "🛕";
    }

    if (mood === "Romantic") {
        return "❤️";
    }

    if (mood === "Calm") {
        return "🌿";
    }

    return "📍";

}

// ================= INTRO SCREEN =================


const typingText =
    document.getElementById("typingText");

const introMessage =
"🌍 Welcome Traveller... Discover Nepal emotionally through Romantic ❤️, Adventure 🏔️, Spiritual 🛕, Happy 😊 and Relax 🌿 tourism using powerful GIS visualization.";

typingText.innerHTML = "";

let letterIndex = 0;

function typeWriter() {

    if (letterIndex < introMessage.length) {

        typingText.innerHTML +=
            introMessage.charAt(letterIndex);

        letterIndex++;

        setTimeout(typeWriter, 40);
    }
}

typeWriter();

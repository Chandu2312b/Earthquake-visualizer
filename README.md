Earthquake Visualizer

Earthquake Visualizer is an interactive web application that visualizes recent earthquake activity around the world. Built with React and React-Leaflet, it allows users to explore seismic events in real-time using data from the USGS Earthquake API.

🧑‍💻 User Persona

Name: Casey
Occupation: Geography Student
Need: Visualize recent earthquake activity worldwide to understand seismic patterns.

🌟 Features

Displays recent earthquakes on an interactive world map using React-Leaflet.

Shows magnitude, location, depth, and time for each earthquake.

Color-coded markers to indicate the severity of earthquakes.

Zoomable and draggable map for detailed exploration.

Data fetched real-time from USGS Earthquake API.

Mobile-friendly and responsive UI.

🛠️ Technologies Used

Frontend: React, React-Leaflet, TailwindCSS (optional), JavaScript

Mapping Library: React-Leaflet

Data Source: USGS Earthquake API

Bundler: Vite

🚀 Installation

Clone the repository:

git clone <repository-url>
cd earthquake-visualizer


Install dependencies:

npm install


Run the development server:

npm run dev


Open your browser at http://localhost:5173

📦 Available Scripts

npm run dev: Starts the development server

npm run build: Builds the app for production

npm run preview: Previews the production build

🔗 API Used

USGS Earthquake API – Provides real-time earthquake data in GeoJSON format:

https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson


🎯 Future Improvements

Add filter by magnitude or time range

Cluster nearby earthquakes for better visualization using react-leaflet-cluster

Display graphs or charts of earthquake trends
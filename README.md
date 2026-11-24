# NovaVerse

NovaVerse is an interactive 3D universe website, rebuilt with React 18 and polished to a premium finish. Fly through a glowing starfield, orbit a giant ringed planet, meet its three moons, and explore four distant worlds, all rendered live in your browser with Three.js inside a React app.

## Features

- A large glowing ringed planet, Nova Prime, slowly rotating at the center of the scene
- Three orbiting moons: Luna One, Luna Two and Luna Three
- Four distant planets to discover: Ember, Azure, Verdant and Frost
- A starfield of 2,400 twinkling stars, soft nebula clouds and floating dust particles
- Shooting stars that streak across the sky
- Richer lighting with a warm sun, a violet rim light, a pink fill light and a soft atmosphere halo around Nova Prime
- Double rings around Nova Prime with a layered glow
- Drag to rotate the universe with smooth inertia, scroll to zoom with damped motion, and gentle auto rotation when idle
- Click any planet or moon to open its info panel with a fun fact
- Like buttons for every celestial body, saved with PHP into MySQL
- A live visitor counter and a stats bar showing planets, moons, stars, visitors and total likes
- A short loading screen with an orbiting planet animation while the 3D scene starts
- Polished dark space theme with refined glassmorphism cards, gradient text, smooth entrance animations and nicer hover states
- Fully responsive Bootstrap 5 layout
- Header showing the creator, Hammad Khan, with an HK avatar

## Tech Stack

HTML, CSS, JavaScript, React 18, Bootstrap 5, Three.js, PHP and MySQL.

## How React Is Used

The front end is built with React 18 loaded from a CDN, with components and hooks. The App component owns the UI state, including the selected celestial body, likes and visitor counts. The Three.js scene lives inside the App through useEffect and useRef, so it starts when the page mounts and cleans up when the page unmounts. Smaller components handle the header, hero, info panel, planet chips, stats bar and loading screen. The scene reports clicks and its ready state back to React through callbacks.

## Project Structure

- index.php, the main page that mounts the React app and passes the server numbers to it
- config.php, the PDO MySQL connection
- database.sql, the database, tables and sample data
- save_reaction.php, records a like for a celestial body and returns JSON
- get_stats.php, returns visitor and like counts as JSON
- assets/css/style.css, the polished dark space theme, glassmorphism styles and loading screen
- assets/js/app.jsx, the React app with components and hooks
- assets/js/scene.js, the Three.js scene, stars, shooting stars, nebula, planets and controls
- assets/js/planets.js, the planet and moon data with names, facts, colors and sizes

## Setup

1. Copy the project into your web server folder, for example htdocs or www.
2. Create the database by importing database.sql into MySQL.
3. Open config.php and set your database host, name, username and password.
4. Open index.php in your browser.
5. Drag to rotate, scroll to zoom, and click a planet or moon to learn about it.

## How Likes Work

Clicking the heart on a celestial body sends its id to save_reaction.php, which adds one like to that body in the reactions table. The totals are read back through get_stats.php. If the database is not reachable, likes are kept in the browser for the visit so the page still works.

## Stats Shown

5 planets, 3 moons, 2,400 stars, a live visitor counter and total likes across all celestial bodies.

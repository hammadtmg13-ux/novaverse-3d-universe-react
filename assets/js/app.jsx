// NovaVerse React front end, built with React 18.
// Components and hooks: the Three.js scene lives inside a React component
// through useEffect and useRef, and the UI state lives in React.
// Likes are saved through save_reaction.php and counts are read from
// get_stats.php. When the server is not reachable, everything still works
// with the built in sample numbers kept in this browser visit.

const { useState, useEffect, useRef } = React;
const DATA = window.NOVAVERSE;
const BODIES = DATA.BODIES;

function initialLikes() {
    const map = {};
    BODIES.forEach(function (b) { map[b.id] = b.likes; });
    const server = window.NOVAVERSE_INITIAL && window.NOVAVERSE_INITIAL.likes;
    if (server) {
        Object.keys(server).forEach(function (key) {
            if (map[key] !== undefined) {
                map[key] = server[key];
            }
        });
    }
    return map;
}

function initialLiked() {
    const map = {};
    BODIES.forEach(function (b) {
        map[b.id] = localStorage.getItem('novaverse-liked-' + b.id) === '1';
    });
    return map;
}

function initialVisitors() {
    if (window.NOVAVERSE_INITIAL && typeof window.NOVAVERSE_INITIAL.visitors === 'number') {
        return window.NOVAVERSE_INITIAL.visitors;
    }
    return DATA.BASE_VISITORS;
}

function Header() {
    return (
        <header className="overlay topbar">
            <div className="brand interactive">
                <div className="brand-logo">N</div>
                <div>
                    <div className="brand-name">NOVAVERSE</div>
                    <div className="brand-tag">INTERACTIVE 3D UNIVERSE</div>
                </div>
            </div>
            <div className="glass user-chip interactive">
                <div className="hk-avatar">HK</div>
                <div>
                    <div className="user-name">Hammad Khan</div>
                    <div className="user-role">Web Developer</div>
                </div>
            </div>
        </header>
    );
}

function Hero({ onExplore }) {
    return (
        <section className="overlay hero glass">
            <div className="hero-badge">Built with React and Three.js</div>
            <h1>Explore a universe <span>you can touch</span></h1>
            <p>Fly around Nova Prime, a glowing ringed planet, meet its three moons, and discover four distant worlds among 2,400 stars. Drag to spin the universe, scroll to zoom, and click any world to learn its story.</p>
            <button type="button" className="btn btn-glow me-2" onClick={onExplore}>Explore a world</button>
            <a href="#stats" className="btn btn-ghost">See the stats</a>
        </section>
    );
}

function InfoPanel({ body, likes, liked, onLike, onClose }) {
    if (!body) {
        return (
            <aside className="overlay info-panel glass interactive" aria-hidden="true">
                <button type="button" className="info-close" aria-label="Close" onClick={onClose}>&times;</button>
                <div className="info-type">Planet</div>
                <h2>Nova Prime</h2>
                <p>Click a planet or moon to learn its story.</p>
                <div className="info-likes">
                    <button type="button" className="like-btn">Like this world</button>
                    <span className="like-count">0 likes</span>
                </div>
            </aside>
        );
    }
    return (
        <aside className="overlay info-panel glass interactive show">
            <button type="button" className="info-close" aria-label="Close" onClick={onClose}>&times;</button>
            <div className="info-type">{body.type}</div>
            <h2>{body.name}</h2>
            <p>{body.fact}</p>
            <div className="info-likes">
                <button
                    type="button"
                    className={liked ? 'like-btn liked' : 'like-btn'}
                    onClick={function () { onLike(body.id); }}
                >
                    {liked ? 'Liked' : 'Like this world'}
                </button>
                <span className="like-count">{likes.toLocaleString('en-US')} likes</span>
            </div>
        </aside>
    );
}

function Chips({ selectedId, onSelect }) {
    return (
        <nav className="overlay chips interactive" aria-label="Celestial bodies">
            {BODIES.map(function (b) {
                const hex = '#' + b.color.toString(16).padStart(6, '0');
                return (
                    <button
                        key={b.id}
                        type="button"
                        className={selectedId === b.id ? 'chip-btn active' : 'chip-btn'}
                        style={{ '--body-color': hex }}
                        onClick={function () { onSelect(b.id); }}
                    >
                        <span className="chip-dot" style={{ background: hex }}></span>
                        {b.name}
                    </button>
                );
            })}
        </nav>
    );
}

function StatsBar({ visitors, totalLikes }) {
    return (
        <div id="stats" className="overlay statsbar glass">
            <div className="stat">
                <div className="stat-value">5</div>
                <div className="stat-label">Planets</div>
            </div>
            <div className="stat">
                <div className="stat-value">3</div>
                <div className="stat-label">Moons</div>
            </div>
            <div className="stat">
                <div className="stat-value">2,400</div>
                <div className="stat-label">Stars</div>
            </div>
            <div className="stat">
                <div className="stat-value">{visitors.toLocaleString('en-US')}</div>
                <div className="stat-label">Visitors</div>
            </div>
            <div className="stat">
                <div className="stat-value">{totalLikes.toLocaleString('en-US')}</div>
                <div className="stat-label">Total Likes</div>
            </div>
        </div>
    );
}

function LoadingScreen({ ready }) {
    return (
        <div className={ready ? 'loading-screen hidden' : 'loading-screen'} aria-hidden={ready}>
            <div className="loading-orbit">
                <div className="loading-planet"></div>
                <div className="loading-moon"></div>
            </div>
            <div className="loading-title">NOVAVERSE</div>
            <div className="loading-text">Entering the universe...</div>
        </div>
    );
}

function App() {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(initialLiked);
    const [visitors, setVisitors] = useState(initialVisitors);

    useEffect(function () {
        const scene = window.NovaScene.init(containerRef.current, {
            onSelect: function (id) { setSelectedId(id); },
            onReady: function () { setLoading(false); }
        });

        // Load live counts from the server, falling back to sample numbers.
        fetch('get_stats.php')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d && d.reactions) {
                    setLikes(function (prev) {
                        const next = Object.assign({}, prev);
                        Object.keys(d.reactions).forEach(function (key) {
                            if (next[key] !== undefined) {
                                next[key] = d.reactions[key];
                            }
                        });
                        return next;
                    });
                }
                if (d && typeof d.visitors === 'number') {
                    setVisitors(d.visitors);
                }
            })
            .catch(function () {
                // Server unreachable: the sample numbers already show.
            });

        return function () {
            scene.dispose();
        };
    }, []);

    const totalLikes = Object.values(likes).reduce(function (a, b) { return a + b; }, 0);
    const selectedBody = selectedId ? BODIES.find(function (b) { return b.id === selectedId; }) : null;

    function showBodyInfo(id) {
        setSelectedId(id);
    }

    function closePanel() {
        setSelectedId(null);
    }

    function exploreRandom() {
        const random = BODIES[Math.floor(Math.random() * BODIES.length)];
        setSelectedId(random.id);
    }

    function handleLike(id) {
        if (liked[id]) {
            return;
        }
        const nextLiked = Object.assign({}, liked);
        nextLiked[id] = true;
        setLiked(nextLiked);
        localStorage.setItem('novaverse-liked-' + id, '1');
        setLikes(function (prev) {
            const next = Object.assign({}, prev);
            next[id] = (next[id] || 0) + 1;
            return next;
        });

        fetch('save_reaction.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: id })
        })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d && d.success && typeof d.likes === 'number') {
                    setLikes(function (prev) {
                        const next = Object.assign({}, prev);
                        next[id] = d.likes;
                        return next;
                    });
                }
            })
            .catch(function () {
                // Server unreachable: the local count already updated above.
            });
    }

    return (
        <React.Fragment>
            <div id="scene-container" ref={containerRef}></div>
            <Header />
            <Hero onExplore={exploreRandom} />
            <InfoPanel
                body={selectedBody}
                likes={selectedBody ? (likes[selectedBody.id] || 0) : 0}
                liked={selectedBody ? !!liked[selectedBody.id] : false}
                onLike={handleLike}
                onClose={closePanel}
            />
            <Chips selectedId={selectedId} onSelect={showBodyInfo} />
            <StatsBar visitors={visitors} totalLikes={totalLikes} />
            <div className="overlay hint glass">Drag to rotate &nbsp;.&nbsp; Scroll to zoom &nbsp;.&nbsp; Click a planet or moon</div>
            <LoadingScreen ready={!loading} />
        </React.Fragment>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

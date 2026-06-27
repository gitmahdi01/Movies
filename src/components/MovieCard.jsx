import { useState } from "react"
import "../css/MovieCard.css"
import { useMovieContext } from "../contexts/MovieContext"
import { getWatchProviders } from "../services/api";

function MovieCard({movie}) {
    const {isFavorite, addToFavorites, removeFromFavorites} = useMovieContext()
    const favorite = isFavorite(movie.id)
    const [providers, setProviders] = useState(null)
    const [loadingProviders, setLoadingProviders] = useState(false)
    const [showProviders, setShowProviders] = useState(false)

    function onFavoriteClick(e) {
        e.preventDefault()
        if (favorite) removeFromFavorites(movie.id)
        else addToFavorites(movie)
    }

    async function onCardClick() {
        setShowProviders(true)
        if (providers) return // already fetched, don't refetch
        setLoadingProviders(true)
        const results = await getWatchProviders(movie.id)
        setProviders(results)
        setLoadingProviders(false)
    }

    function closeProviders(e) {
        e.stopPropagation()
        setShowProviders(false)
    }

    // Pick a region - fall back through a couple options since
    // TMDB coverage varies a lot by country
    const regionData = providers?.ZA || providers?.US || providers?.GB || null

    return <div className="movie-card" onClick={onCardClick}>
        <div className="movie-poster">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title}/>
            <div className="movie-overlay">
                <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                    ♥
                </button>
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>{movie.release_date?.split("-")[0]}</p>
        </div>

        {showProviders && (
            <div className="providers-overlay" onClick={closeProviders}>
                <div className="providers-panel" onClick={(e) => e.stopPropagation()}>
                    <button className="providers-close" onClick={closeProviders}>✕</button>
                    <h4>Where to watch</h4>
                    {loadingProviders && <p>Loading…</p>}
                    {!loadingProviders && !regionData && <p>No streaming info available for your region.</p>}
                    {!loadingProviders && regionData && (
                        <div className="providers-list">
                            {regionData.flatrate?.map(p => (
                                <img key={p.provider_id} src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name} title={p.provider_name} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
}

export default MovieCard
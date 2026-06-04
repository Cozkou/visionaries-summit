/** Fixed editorial film grain — storefront only; pointer-events none */
export function FilmGrainOverlay() {
  return (
    <div className="store-film-grain" aria-hidden>
      <span className="store-film-grain-layer store-film-grain-layer--coarse" />
      <span className="store-film-grain-layer store-film-grain-layer--fine" />
    </div>
  );
}

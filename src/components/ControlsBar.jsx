function ControlsBar({ onZoomIn, onZoomOut, onReset, speed, onSpeedChange, paused, onPauseToggle, moonsVisible, onMoonsToggle, onInfo }) {
  return (
    <div id="controls-bar">
      <button className="ctrl-btn ctrl-btn-zoom" onClick={onZoomOut} title="Zoom out">−</button>
      <button className="ctrl-btn ctrl-btn-zoom" onClick={onZoomIn} title="Zoom in">+</button>

      <div className="ctrl-sep" />

      <button className="ctrl-btn" onClick={onReset} title="Reset view">⟲</button>

      <div className="ctrl-sep" />

      <button className="ctrl-btn" onClick={() => onSpeedChange(Math.max(0.025, speed * 0.5))} title="Slow down">−</button>
      <span id="speed-display">{(speed / 0.1).toFixed(1)}×</span>
      <button className="ctrl-btn" onClick={() => onSpeedChange(Math.min(5, speed * 2))} title="Speed up">+</button>

      <div className="ctrl-sep" />

      <button className="ctrl-btn" onClick={onPauseToggle} title="Pause / Resume">
        {paused ? '▶' : '⏸'}
      </button>

      <div className="ctrl-sep" />

      <button className="ctrl-btn" onClick={onMoonsToggle} title="Toggle moons" style={{ opacity: moonsVisible ? 1 : 0.4 }}>
        ☾
      </button>

      <div className="ctrl-sep" />

      <button className="ctrl-btn" onClick={onInfo} title="Info">ℹ</button>
    </div>
  );
}

export default ControlsBar;

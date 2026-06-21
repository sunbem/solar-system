function InfoPanel({ onClose }) {
  return (
    <div id="info-panel">
      <h2>Solar System</h2>
      <p>An interactive 3D visualization of our solar system with accurate relative orbital speeds.</p>
      <div className="planet-list">
        <span className="name">Mercury</span><span>88 days</span>
        <span className="name">Venus</span><span>225 days</span>
        <span className="name">Earth</span><span>365 days</span>
        <span className="name">Mars</span><span>687 days</span>
        <span className="name">Jupiter</span><span>12 years</span>
        <span className="name">Saturn</span><span>29 years</span>
        <span className="name">Uranus</span><span>84 years</span>
        <span className="name">Neptune</span><span>165 years</span>
      </div>
      <p style={{ fontSize: 12, opacity: 0.5 }}>Orbital periods shown relative to Earth days/years.</p>
      <button id="close-info" onClick={onClose}>Close</button>
    </div>
  );
}

export default InfoPanel;

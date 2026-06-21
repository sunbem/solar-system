import { useState, useRef } from 'react';
import Scene3D from './components/Scene3D';
import ControlsBar from './components/ControlsBar';
import InfoPanel from './components/InfoPanel';

function App() {
  const sceneRef = useRef(null);
  const [speed, setSpeed] = useState(0.1);
  const [paused, setPaused] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [moonsVisible, setMoonsVisible] = useState(true);

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      setPaused((p) => !p);
    }
  };

  return (
    <div onKeyDown={handleKeyDown} style={{ width: '100%', height: '100%' }}>
      <Scene3D ref={sceneRef} speed={speed} paused={paused} moonsVisible={moonsVisible} />

      <div id="ui">
        <div id="title">Solar System</div>
        <div id="watermark">Vibe Coded by Sunbeam CSE 241 using OpenCode</div>
        {moonsVisible && <div id="moon-disclaimer">Showing only major moons — not all moons are displayed</div>}
      </div>

      <ControlsBar
        onZoomIn={() => sceneRef.current?.zoomIn()}
        onZoomOut={() => sceneRef.current?.zoomOut()}
        onReset={() => sceneRef.current?.resetView()}
        speed={speed}
        onSpeedChange={setSpeed}
        paused={paused}
        onPauseToggle={() => setPaused((p) => !p)}
        moonsVisible={moonsVisible}
        onMoonsToggle={() => setMoonsVisible((v) => !v)}
        onInfo={() => setInfoVisible(true)}
      />

      {infoVisible && <InfoPanel onClose={() => setInfoVisible(false)} />}
    </div>
  );
}

export default App;

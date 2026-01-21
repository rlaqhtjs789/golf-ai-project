import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EngineConnectionModal } from './components/EngineConnectionModal';

function App() {
  return (
    <Router>
      {/* 엔진 연결 모달 (전역) - Python 서버 연결 상태 자동 모니터링 */}
      <EngineConnectionModal />
      
      {/* 라우트 */}
      <Routes>
        <Route path="/" element={<div className="p-8"><h1 className="text-2xl font-bold">GTS AI Analysis</h1><p className="mt-4">영상 분석 시스템</p></div>} />
        {/* 필요한 라우트를 여기에 추가하세요 */}
      </Routes>
    </Router>
  );
}

export default App;



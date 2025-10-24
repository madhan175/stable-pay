import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Send from './pages/Send';
import Receive from './pages/Receive';
import KYC from './pages/KYC';
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="send" element={<Send />} />
              <Route path="receive" element={<Receive />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
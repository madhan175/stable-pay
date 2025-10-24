import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Send from './pages/Send';
import Receive from './pages/Receive';
import { WalletProvider } from './context/WalletContext';
import { KYCProvider } from './context/KYCContext';

function App() {
  return (
    <WalletProvider>
      <KYCProvider>
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
      </KYCProvider>
    </WalletProvider>
  );
}

export default App;
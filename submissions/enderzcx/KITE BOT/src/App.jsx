import { useState } from 'react';
import Transfer from './Transfer';
import LoginPage from './LoginPage';
import RequestPage from './RequestPage';
import './App.css';

function App() {
  const [view, setView] = useState('login');

  return (
    <div className="app">
      {view === 'login' && <LoginPage onLogin={() => setView('request')} />}
      {view === 'request' && (
        <RequestPage onOpenTransfer={() => setView('transfer')} />
      )}
      {view === 'transfer' && (
        <Transfer onBack={() => setView('request')} />
      )}
    </div>
  );
}

export default App;


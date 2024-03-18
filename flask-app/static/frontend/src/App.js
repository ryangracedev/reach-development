import './App.css';
import HomePage from './pages/homePage';
import CreateParty from './pages/createPartyOne';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-party" element={<CreateParty />} />
      </Routes>
    </div>
  );
}

export default App;

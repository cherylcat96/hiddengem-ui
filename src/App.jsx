import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Discover from './pages/Discover';
import GemDetail from './pages/GemDetail';
import Create from './pages/Create';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<div>Landing page</div>} />
          <Route path="/signup"        element={<SignUp />} />
          <Route path="/signin"        element={<SignIn />} />
          <Route path="/verify-email"  element={<div>Verify Email</div>} />
          <Route path="/discover"      element={<Discover />} />
          <Route path="/gems/:id"      element={<GemDetail />} />
          <Route path="/create"        element={<Create />} />
          <Route path="/profile/:username" element={<div>Profile</div>} />
          <Route path="/gems/:id"      element={<div>Gem Detail</div>} />
          <Route path="/gems/:id/edit" element={<div>Edit Gem</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
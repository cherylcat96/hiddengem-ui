import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<div>Landing page</div>} />
          <Route path="/signup"        element={<SignUp />} />
          <Route path="/signin"        element={<SignIn />} />
          <Route path="/verify-email"  element={<div>Verify Email</div>} />
          <Route path="/discover"      element={<div>Discover</div>} />
          <Route path="/create"        element={<div>Create Gem</div>} />
          <Route path="/profile/:username" element={<div>Profile</div>} />
          <Route path="/gems/:id"      element={<div>Gem Detail</div>} />
          <Route path="/gems/:id/edit" element={<div>Edit Gem</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
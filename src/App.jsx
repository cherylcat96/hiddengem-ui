import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Landing page</div>} />
        <Route path="/signup" element={<div>Sign Up</div>} />
        <Route path="/signin" element={<div>Sign In</div>} />
        <Route path="/verify-email" element={<div>Verify Email</div>} />
        <Route path="/discover" element={<div>Discover</div>} />
        <Route path="/create" element={<div>Create Gem</div>} />
        <Route path="/profile/:username" element={<div>Profile</div>} />
        <Route path="/gems/:id" element={<div>Gem Detail</div>} />
        <Route path="/gems/:id/edit" element={<div>Edit Gem</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
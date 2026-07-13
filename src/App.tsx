import { Routes, Route } from 'react-router-dom';
import StorefrontPage from './pages/StorefrontPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/m/:username" element={<StorefrontPage />} />
      <Route path="/m/:username/checkout" element={<CheckoutPage />} />
      <Route path="/m/:username/success" element={<SuccessPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
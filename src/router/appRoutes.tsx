import { Routes, Route } from 'react-router-dom';
import App from '../pages/App';
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import FirstStepPage from '../pages/FirstStepPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/Home" element={<HomePage />}>
      </Route>
      <Route path="/Auth" element={<AuthPage />} />
      <Route path="/PairUp" element={<FirstStepPage />} />
    </Routes>
  );
};

export default AppRoutes;

import { Routes, Route } from 'react-router-dom';
import App from '../pages/App';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  );
};

export default AppRoutes;

import { Routes, Route } from 'react-router-dom';
import App from '../pages/App';
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import FirstStepPage from '../pages/FirstStepPage';
import AccountPart from '../pages/parts/AccountPart';
import CategoryPart from '../pages/parts/CategoryPart';
import BudgetPart from '../pages/parts/BudgetPart';
import TxnPart from '../pages/parts/TxnPart';
import HomePart from '../pages/parts/HomePart';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/Home" element={<HomePage />}>
        <Route path="/Home" element={<HomePart />} />
        <Route path="/Home/Account" element={<AccountPart />} />
        <Route path="/Home/CategoriesAndTags" element={<CategoryPart />} />
        <Route path="/Home/Budget" element={<BudgetPart />} />
        <Route path="/Home/Transactions" element={<TxnPart />} />
      </Route>
      <Route path="/Auth" element={<AuthPage />} />
      <Route path="/PairUp" element={<FirstStepPage />} />
    </Routes>
  );
};

export default AppRoutes;

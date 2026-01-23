import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ConversationsPage from './pages/WhatsApp/ConversationsPage';
import ProductsPage from './pages/Products/ProductsPage';
import CustomersPage from './pages/Customers/CustomersPage';
import SalesPage from './pages/Sales/SalesPage';
import SalesListPage from './pages/Sales/SalesListPage';
import InvoicesPage from './pages/Invoices/InvoicesPage';
import SettingsPage from './pages/Settings/SettingsPage';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/whatsapp" replace />} />
          <Route path="whatsapp" element={<ConversationsPage />} />
          <Route path="sales" element={<SalesListPage />} />
          <Route path="pos" element={<SalesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

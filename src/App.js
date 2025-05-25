import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Producto from './pages/Producto';
import Login from './pages/IniciarSesion';
import Header from './components/Header';
import Footer from './components/Footer';
import Carrito from './pages/Carrito';
import { ProductosProvider } from './context/ProductosContext';
import { UserProvider } from './context/UserContext';
import Editar from './pages/EditarPerfil';

function App() {
  // Estado para forzar recarga del header
  const [headerKey, setHeaderKey] = useState(0);

  // Función para pasar a Login y que fuerce recarga del header tras login/logout
  const handleHeaderReload = () => setHeaderKey(k => k + 1);

  return (
    <ProductosProvider>
      <UserProvider>
        <Router>
          <Header key={headerKey} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/producto' element={<Producto />} />
            <Route path='/login' element={<Login onLogin={handleHeaderReload} />} />
            <Route path='/Editar' element={<Editar />} />
            <Route path='/Carrito' element={<Carrito/>}/>
          </Routes >
          <Footer />
        </Router>
      </UserProvider>
    </ProductosProvider>
  );
}

export default App;

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
import { PublicacionesProvider } from './context/PublicacionesContext';
import Editar from './pages/EditarPerfil';
import CrearCuenta from './pages/CrearCuenta';
import Pasarela from './pages/Pasarela';
import Publicacion from './pages/Publicacion';
import Posts from './pages/Posts';
import NuevoProducto from './pages/NuevoProducto';
import NuevaPublicacion from './pages/NuevaPublicacion';
import EditarProducto from './pages/EditarProducto';
import EditarPublicacion from './pages/EditarPublicacion';
import Admin from './pages/Admin';
import Valoraciones from './pages/Valoraciones';

function App() {
  // Estado para forzar recarga del header
  const [headerKey, setHeaderKey] = useState(0);

  // Función para pasar a Login y que fuerce recarga del header tras login/logout
  const handleHeaderReload = () => setHeaderKey(k => k + 1);

  return (
    <ProductosProvider>
      <UserProvider>
        <PublicacionesProvider>
          <Router>
            <Header key={headerKey} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path='/producto' element={<Producto />} />
              <Route path='/login' element={<Login onLogin={handleHeaderReload} />} />
              <Route path='/Editar' element={<Editar />} />
              <Route path='/Carrito' element={<Carrito />} />
              <Route path='/CrearCuenta' element={<CrearCuenta />} />
              <Route path='/Pasarela' element={<Pasarela />} />
              <Route path='/Publicacion' element={<Publicacion />} />
              <Route path='/Posts' element={<Posts />} />
              <Route path='/NuevoProducto' element={<NuevoProducto/>}/>
              <Route path='/NuevaPublicacion' element={<NuevaPublicacion/>}/>
              <Route path='/EditarProducto' element={<EditarProducto/>}/>
              <Route path='/EditarPublicacion' element={<EditarPublicacion/>}/>
              <Route path='/Administracion' element={<Admin/>}/>
              <Route path='/Valoraciones' element={<Valoraciones/>}/>
            </Routes >
            <Footer />
          </Router>
        </PublicacionesProvider>
      </UserProvider>
    </ProductosProvider>
  );
}

export default App;

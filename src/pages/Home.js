import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import addCarrito from '../assets/Iconos/tdesign--cart-add.svg';
import "./css/estilos.css";
import { useProductos } from '../context/ProductosContext';
import Modal from '../components/Modal';

export default function Home() {
  const location = useLocation();
  const { productos, setProductos } = useProductos();
  const [nuevosProductos, setNuevosProductos] = useState([]);
  const [productosSegundaMano, setProductosSegundaMano] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "/Proyectos/LvUp_backend/api";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};

  console.log(getPhpBackendUrl());

  const categoriaToId = {
    'Consolas': 1,
    'Videojuegos': 2,
    'Accesorios': 3,
    'Merchandising': 4
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.categoria) {
      setCategoriaSeleccionada(location.state.categoria);
    } else {
      setCategoriaSeleccionada(null);
    }
  }, [location.state]);

  const handleAddToCart = async (producto_id) => {
    const usuario_id = localStorage.getItem('id_usuario');
    console.log(usuario_id);
    if (!usuario_id) {
      setModal({
        isOpen: true,
        title: 'Sesión requerida',
        message: 'Debes iniciar sesión para añadir productos al carrito',
        type: 'warning'
      });
      return;
    }

    const body = {
      usuario_id: usuario_id,
      producto_id: producto_id
    };

    try {
      const response = await fetch(`${getPhpBackendUrl()}/introducir_carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'//, 'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      console.log(data)
      if (data.mensaje) {
        setModal({
          isOpen: true,
          title: '¡Producto añadido!',
          message: 'El producto se ha añadido correctamente al carrito',
          type: 'success'
        });
      } else {
        setModal({
          isOpen: true,
          title: 'Error',
          message: 'No se pudo añadir el producto al carrito. Inténtalo de nuevo.',
          type: 'error'
        });
      }
    } catch (error) {
      console.log('Error:', error);
      setModal({
        isOpen: true,
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
        type: 'error'
      });
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        let data;
        if (categoriaSeleccionada && categoriaToId[categoriaSeleccionada]) {
          const response = await fetch(`${getPhpBackendUrl()}/obtener_productos_categoria/${categoriaToId[categoriaSeleccionada]}`);
          if (!response.ok) throw new Error('Error al cargar los productos de la categoría');
          data = await response.json();
          // Filtrar productos con stock > 0
          const productosFiltrados = (data.productos || []).filter(producto => producto.stock > 0);
          setProductos(productosFiltrados);
          setNuevosProductos([]);
          setProductosSegundaMano([]);
        } else {
          const response = await fetch(`${getPhpBackendUrl()}/obtener_productos`);
          if (!response.ok) throw new Error('Error al cargar los productos');
          data = await response.json();
          // Filtrar productos con stock > 0
          const productosConStock = (data.productos || []).filter(producto => producto.stock > 0);
          setProductos(productosConStock);
          const nuevos = productosConStock.filter(producto => producto.estado === "nuevo");
          const segundaMano = productosConStock.filter(producto => producto.estado === "segunda_mano");
          setNuevosProductos(nuevos);
          setProductosSegundaMano(segundaMano);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al llamar a la función: " + err.message);
        setLoading(false);
      }
    };

    fetchProductos();
  }, [categoriaSeleccionada]);

  // Filtrado por categoría

  console.log(categoriaSeleccionada)
  const productosFiltrados = categoriaSeleccionada
    ? productos
    : productos;

  if (loading) return <div>Cargando...</div>;
  console.log(localStorage);

  return (
    <div id='container'>
      {categoriaSeleccionada && <h2>Productos de {categoriaSeleccionada}</h2>}
      {!categoriaSeleccionada && <h2>Productos nuevos</h2>}
      <div className="productos">
        {(categoriaSeleccionada ? productosFiltrados : nuevosProductos).map(producto => (
          <div key={producto.id} className="tarjeta-producto">
            <div className="producto">
              <div id='f-line-producto'>
                <img src={`https://backendreactproject-production.up.railway.app${producto.imagen_url}`}
                  alt={producto.nombre}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/producto', { state: { id_producto: producto.id_producto, fromNavigate: true } })}
                />
                <div className="producto-info">
                  <div className="producto-header">
                    <h3>
                      <Link
                        className='link'
                        to={`/producto`}
                        state={{ id_producto: producto.id_producto, fromNavigate: true }}
                      >
                        {producto.nombre}
                      </Link>
                    </h3>
                  </div>
                  <p>{producto.descripcion}</p>
                  <p className="precio">Desde {producto.precio}€</p>
                </div>
                <img
                  id='addCarritoIcon'
                  onClick={() => handleAddToCart(producto.id_producto)}
                  src={addCarrito}
                  alt='carrito'

                />
                <button id='addCarritoBtn' onClick={() => handleAddToCart(producto.id_producto)}>
                  Añadir a la cesta
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!categoriaSeleccionada && <>
        <h2>Productos de Segunda mano</h2>
        <div className="productos">
          {productosSegundaMano.map(producto => (
            <div key={producto.id} className="tarjeta-producto">
              <div className="productos">
                <div id='f-line-producto'>
                  <img src={`https://backendreactproject-production.up.railway.app${producto.imagen_url}`} alt={producto.nombre} />
                  <div className="producto-info">
                    <div className="producto-header">
                      <h3>
                        <Link
                          className='link'
                          to={`/producto`}
                          state={{ id_producto: producto.id_producto, fromNavigate: true }}
                        >
                          {producto.nombre}
                        </Link>
                      </h3>
                    </div>
                    <p>{producto.descripcion}</p>
                    <p className="precio">Desde {producto.precio}€</p>
                  </div>
                  <img
                    id='addCarritoIcon'
                    onClick={() => handleAddToCart(producto.id_producto)}
                    src={addCarrito}
                    alt='carrito'

                  />
                  <button id='addCarritoBtn' onClick={() => handleAddToCart(producto.id_producto)}>
                    Añadir a la cesta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
      }
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
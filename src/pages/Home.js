import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import addCarrito from '../assets/Iconos/tdesign--cart-add.svg';
import "./css/Home.css";
import { useProductos } from '../context/ProductosContext';
import Modal from '../components/Modal';

export default function Home() {
  const { productos, setProductos } = useProductos();
  const [nuevosProductos, setNuevosProductos] = useState([]);
  const [productosSegundaMano, setProductosSegundaMano] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const handleAddToCart = async (producto_id) => {
    const usuario_id = localStorage.getItem('id_usuario');
    if (!usuario_id) {
      setModal({
        isOpen: true,
        title: 'Sesión requerida',
        message: 'Debes iniciar sesión para añadir productos al carrito',
        type: 'warning'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost/Proyectos/LvUp_backend/api/introducir_carrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `usuario_id=${usuario_id}&producto_id=${producto_id}`
      });

      const data = await response.json();
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
      console.error('Error:', error);
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
        const response = await fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_productos');
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();
        setProductos(data.productos);
        console.log(data.productos)

        const nuevos = data.productos.filter(producto => producto.estado === "nuevo");
        const segundaMano = data.productos.filter(producto => producto.estado === "segunda_mano");

        setNuevosProductos(nuevos);
        setProductosSegundaMano(segundaMano);
        setLoading(false);
      } catch (err) {
        console.error("Error al llamar a la función: " + err.message);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) return <div>Cargando...</div>;
  console.log(localStorage.getItem('id_usuario'));

  return (
    <div id='container'>
      <h2>Productos nuevos</h2>
      <div className="productos">
        {nuevosProductos.map(producto => (
          <div key={producto.id} className="tarjeta-producto">
            <div className="productos">
              <div id='f-line-producto'>
                <img src={producto.imagen_url} alt={producto.nombre} />
                <div className="producto-info">
                  <div className="producto-header">
                    <h3>
                      <Link
                        className='link'
                        to={`/producto`}
                        state={{ id_producto: producto.id_producto }}
                      >
                        {producto.nombre}
                      </Link>
                    </h3>
                    <img
                      onClick={() => handleAddToCart(producto.id_producto)}
                      src={addCarrito}
                      alt='carrito'
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <p>{producto.descripcion}</p>
                  <p className="precio">Desde {producto.precio}€</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Productos de Segunda mano</h2>
      <div className="productos">
        {productosSegundaMano.map(producto => (
          <div key={producto.id} className="tarjeta-producto">
            <div className="productos">
              <div id='f-line-producto'>
                <img src={producto.imagen_url} alt={producto.nombre} />
                <div className="producto-info">
                  <div className="producto-header">
                    <h3>
                      <Link
                        className="link"
                        to={`/producto`}
                        state={{ id_producto: producto.id_producto }}
                      >
                        {producto.nombre}
                      </Link>
                    </h3>
                    <img src={addCarrito} alt='carrito' onClick={() => handleAddToCart(producto.id_producto)} style={{ cursor: 'pointer' }} />
                  </div>
                  <p>{producto.descripcion}</p>
                  <p className="precio">Desde {producto.precio}€</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import addCarrito from '../assets/Iconos/tdesign--cart-add.svg';
import "./css/Home.css";

export default function Home() {
  const [nuevosProductos, setNuevosProductos] = useState([]);
  const [productosSegundaMano, setProductosSegundaMano] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_productos');
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();

        // Separar productos por estado
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
                    <h3>{producto.nombre}</h3>
                    <img src={addCarrito} alt='carrito' />
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
                    <h3>{producto.nombre}</h3>
                    <img src={addCarrito} alt='carrito' />
                  </div>
                  <p>{producto.descripcion}</p>
                  <p className="precio">Desde {producto.precio}€</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
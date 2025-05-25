import { useProductos } from '../context/ProductosContext';
import { useLocation } from 'react-router-dom';
import './css/Producto.css';
import paypal from '../assets/Iconos/mingcute--paypal-line.svg';
import google from '../assets/Iconos/devicon--google.svg';
import addCarrito from '../assets/Iconos/tdesign--cart-add.svg';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import Modal from '../components/Modal';

export default function Producto() {
    console.log(paypal)
    const location = useLocation();
    const id_producto = location.state?.id_producto;
    const { productos } = useProductos();
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

    if (!productos) return <div>Cargando...</div>;
    if (!id_producto) return <div>Producto no encontrado</div>;

    const producto = productos.find(p => String(p.id_producto) === String(id_producto));
    if (!producto) return <div>Producto no encontrado</div>;

    let pegiSrc = '';
    switch (producto.pegi) {
        case '3': pegiSrc = '/img_lvup/pegi3.webp'; break;
        case '7': pegiSrc = '/img_lvup/pegi7.webp'; break;
        case '12': pegiSrc = '/img_lvup/pegi12.webp'; break;
        case '16': pegiSrc = '/img_lvup/pegi16.webp'; break;
        case '18': pegiSrc = '/img_lvup/pegi18.webp'; break;
        default: pegiSrc = '';
    }
    console.log(pegiSrc);

    return (
        <div id='container'>
            <div id='detallesProducto'>
                <div id='detallesProducto-fl'>
                    <img src={producto.imagen_url} alt='img_producto' />
                    <div className="info-texto">
                        <h2>{producto.nombre}</h2>
                        <div id='detallesProducto-sl'>
                            <div id='empresa'>
                                <h3>Empresa:</h3>
                                <p>{producto.empresa}</p>
                            </div>
                            <div id='fecha'>
                                <h3>Fecha de salida:</h3>
                                <p>{producto.fecha_salida}</p>
                            </div>
                        </div>
                        {pegiSrc && (
                            <div id='pegi'>
                                <h3>Pegi:</h3>
                                <img src={pegiSrc} alt='pegi' />
                            </div>
                        )}
                    </div>
                </div>
                <div id='descripcion'>
                    {producto.descripcion_larga}
                </div>
                <div id='pago'>
                    <div>
                        <div id='precio'>
                            {producto.precio} €
                        </div>
                        <div className='botones-pago'>
                            <button className='btnPago'>
                                <img src={paypal} alt='paypal' />
                                <p>PayPal</p>
                            </button>
                            <button className='btnPago'>
                                <img src={google} alt='google' />
                                <p>Pay</p>
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button id='comprar'>Comprar ahora</button>
                        </div>
                    </div>
                    <img
                        id='anyadirCarrito'
                        src={addCarrito}
                        alt='añadir carrito'
                        style={{ marginLeft: '1rem', cursor: 'pointer' }}
                        onClick={() => handleAddToCart(producto.id_producto)}
                    />
                </div>
            </div>
            <div id='otrosProductos'>
                <h2>Otros productos</h2>
                {productos
                    .filter(p => String(p.id_producto) !== String(id_producto)) // Excluye el producto principal
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4)
                    .map(producto => (
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
                                                src={addCarrito}
                                                alt='carrito'
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleAddToCart(producto.id_producto)}
                                            />
                                        </div>
                                        <p>{producto.descripcion}</p>
                                        <p className="precio">Desde {producto.precio}€</p>
                                    </div>
                                </div>
                            </div>
                        </div>))}
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
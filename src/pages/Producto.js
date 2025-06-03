import { useProductos } from '../context/ProductosContext';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    const handleAddToCart = async (producto_id) => {
        const usuario_id = localStorage.getItem('id_usuario');
        if (!usuario_id) {
            // Usuario no logueado: manejar carrito en localStorage
            let carrito = JSON.parse(localStorage.getItem('carrito_anonimo') || '[]');
            // Buscar el producto en la lista de productos
            const producto = productos.find(p => p.id_producto === producto_id);
            if (!producto) return;
            const idx = carrito.findIndex(p => p.id_producto === producto_id);
            if (idx !== -1) {
                carrito[idx].cantidad += 1;
            } else {
                carrito.push({ ...producto, cantidad: 1 });
            }
            localStorage.setItem('carrito_anonimo', JSON.stringify(carrito));
            setModal({
                isOpen: true,
                title: '¡Producto añadido!',
                message: 'El producto se ha añadido correctamente al carrito',
                type: 'success'
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

    const handlePagar = () => {

        navigate('/pasarela', { state: { id_producto: id_producto, precio: producto.precio, cantidad: 1, nombre: producto.nombre, vendedor_id: producto.vendedor_id } });
    };

    const closeModal = () => {
        setModal({ isOpen: false, title: '', message: '', type: 'info' });
    };

    // Formatea fecha a DD-MM-YYYY
    function formatFechaDMY(fechaRaw) {
        if (!fechaRaw) return '';
        const [y, m, d] = fechaRaw.split(' ')[0].split('-');
        return `${d}-${m}-${y}`;
    }

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
                    <img src={producto.imagen_url} alt='img_producto' id='imgProducto'/>
                    <div className="info-texto">
                        <div id='prodTit'>
                            <h2>{producto.nombre}</h2>

                        </div>
                        <div id='detallesProducto-sl'>
                            {producto.estado === 'segunda_mano' ? (
                                <>
                                    <div id='usuario'>
                                        <h3>Usuario:</h3>
                                        <p>
                                            <Link className='link' to='/Valoraciones' state={{ id_usuario: producto.vendedor_id }}>
                                                {producto.nombre_usuario || producto.usuario || 'Usuario desconocido'}
                                            </Link>
                                        </p>
                                    </div>
                                    <div id='fecha'>
                                        <h3>Fecha de publicación:</h3>
                                        <p>{formatFechaDMY(producto.fecha_publicacion || producto.fecha_salida)}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div id='empresa'>
                                        <h3>Empresa:</h3>
                                        <p>{producto.empresa}</p>
                                    </div>
                                    <div id='fecha'>
                                        <h3>Fecha de salida:</h3>
                                        <p>{producto.fecha_salida}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {pegiSrc && (
                            <div id='pegi'>
                                <h3>Pegi:</h3>
                                <img src={pegiSrc} alt='pegi' />
                            </div>
                        )}
                    </div>
                    <div>
                        <img
                            id='anyadirCarrito'
                            src={addCarrito}
                            alt='carrito'
                            onClick={() => handleAddToCart(producto.id_producto)}
                        />
                    </div>
                </div>
                <div id='descripcion'>
                    {producto.descripcion_larga}
                </div>
                <div id='pago-producto'>
                    <div>
                        <div id='precio'>
                            {producto.precio} €
                        </div>
                        <div className='botones-pago'>
                            <button className='btnPago' onClick={handlePagar}>
                                <img src={paypal} alt='paypal' />
                                <p>PayPal</p>
                            </button>
                            <button className='btnPago' onClick={handlePagar}>
                                <img src={google} alt='google' />
                                <p>Pay</p>
                            </button>
                        </div>
                        <div id='comprarCtn'>
                            <button id='comprar' onClick={handlePagar}>Comprar ahora</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id='otrosProductos'>
                <h2>Otros productos</h2>
                <div className="productos">
                    {productos.length > 0 &&
                        productos
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 4)
                            .map(producto => (
                                <div key={producto.id_producto} className="tarjeta-producto">
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
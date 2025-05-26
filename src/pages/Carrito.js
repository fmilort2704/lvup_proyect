import { useEffect, useState, useContext } from 'react';
import papelera from '../assets/Iconos/mdi--rubbish-bin-empty.svg';
import mas from '../assets/Iconos/ic--baseline-plus.svg';
import menos from '../assets/Iconos/ic--baseline-minus.svg';
import paypal from '../assets/Iconos/mingcute--paypal-line.svg';
import google from '../assets/Iconos/devicon--google.svg';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import addCarrito from '../assets/Iconos/tdesign--cart-add.svg';
import { ProductosContext } from '../context/ProductosContext';

export default function Carrito() {
    const [productos, setProductos] = useState([]);
    const [otrosProductos, setOtrosProductos] = useState([]);
    const { productos: productosContext } = useContext(ProductosContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    console.log(localStorage.getItem('id_usuario'));
    useEffect(() => {
        const id_usuario = localStorage.getItem('id_usuario');
        console.log(id_usuario)
        if (!id_usuario) {
            setError("No se ha encontrado el usuario");
            setLoading(false);
            return;
        }
        fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_productos_carrito/${id_usuario}`)
            .then(res => res.json())
            .then(data => {
                setProductos(data.carrito);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar el carrito");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (productosContext && productosContext.length > 0) {
            setOtrosProductos(productosContext);
        }
    }, [productosContext]);

    const showModal = (title, message, type = 'info', onConfirm = null) => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm
        });
    };

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
    };

    const recargarCarrito = () => {
        const id_usuario = localStorage.getItem('id_usuario');
        if (!id_usuario) return;

        fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_productos_carrito/${id_usuario}`)
            .then(res => res.json())
            .then(data => {
                setProductos(data.carrito || []);
            })
            .catch(() => {
                showModal("Error", "Error al recargar el carrito", "error");
            });
    };

    const eliminarProducto = (producto_id, nombre_producto) => {
        showModal(
            "Confirmar eliminación",
            `¿Estás seguro de que quieres eliminar "${nombre_producto}" del carrito?`,
            "confirm",
            () => {
                fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_producto_carrito/${producto_id}`, {
                    method: 'DELETE'
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            showModal("Error", data.error, "error");
                        } else {
                            showModal("Éxito", "Producto eliminado del carrito correctamente", "success");
                            recargarCarrito();
                        }
                    })
                    .catch(() => {
                        showModal("Error", "Error al eliminar el producto del carrito", "error");
                    });
                closeModal();
            }
        );
    };

    const incrementarCantidad = (producto_id, nombre_producto) => {
        const id_usuario = localStorage.getItem('id_usuario');

        fetch('http://localhost/Proyectos/LvUp_backend/api/incrementar_carrito', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `usuario_id=${id_usuario}&producto_id=${producto_id}`
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    showModal("Error", data.error, "error");
                } else {
                    recargarCarrito();
                }
            })
            .catch(() => {
                showModal("Error", "Error al incrementar la cantidad", "error");
            });
    };

    const decrementarCantidad = (producto_id, nombre_producto, cantidad_actual) => {
        const id_usuario = localStorage.getItem('id_usuario');

        if (cantidad_actual === 1) {
            showModal(
                "Confirmar eliminación",
                `El producto "${nombre_producto}" tiene cantidad 1. ¿Quieres eliminarlo del carrito?`,
                "confirm",
                () => {
                    fetch('http://localhost/Proyectos/LvUp_backend/api/decrementar_carrito', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `usuario_id=${id_usuario}&producto_id=${producto_id}`
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.error) {
                                showModal("Error", data.error, "error");
                            } else {
                                showModal("Éxito", "Producto eliminado del carrito", "success");
                                recargarCarrito();
                            }
                        })
                        .catch(() => {
                            showModal("Error", "Error al decrementar la cantidad", "error");
                        });
                    closeModal();
                }
            );
        } else {
            fetch('http://localhost/Proyectos/LvUp_backend/api/decrementar_carrito', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `usuario_id=${id_usuario}&producto_id=${producto_id}`
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        showModal("Error", data.error, "error");
                    } else {
                        recargarCarrito();
                    }
                })
                .catch(() => {
                    showModal("Error", "Error al decrementar la cantidad", "error");
                });
        }
    };

    const handleAddToCart = async (producto_id) => {
        const usuario_id = localStorage.getItem('id_usuario');
        if (!usuario_id) {
            showModal(
                'Sesión requerida',
                'Debes iniciar sesión para añadir productos al carrito',
                'warning'
            );
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
                showModal(
                    '¡Producto añadido!',
                    'El producto se ha añadido correctamente al carrito',
                    'success'
                );
                recargarCarrito();
            } else {
                showModal(
                    'Error',
                    'No se pudo añadir el producto al carrito. Inténtalo de nuevo.',
                    'error'
                );
            }
        } catch (error) {
            showModal(
                'Error de conexión',
                'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
                'error'
            );
        }
    };

    if (loading) return <div id="container"><h2>Cargando carrito...</h2></div>;
    if (error) return <div id="container"><h2>{error}</h2></div>;

    return (
        <div id="container">
            <h2>Esta es tu cesta de la compra</h2>
            <div id="carrito-contenedor-principal">
                <div id="carrito" className="carrito-azul">
                    {productos.length === 0 ? (
                        <h3>Tu carrito está vacío</h3>
                    ) : (
                        <>
                            {productos.map((producto, idx) => (
                                <div key={producto.id_producto || idx} className="producto-carrito">
                                    <div className="producto-carrito-header">
                                        <img src={producto.imagen_url} alt='producto_imagen' />                                        <div className="producto-carrito-header-info">
                                            <h3>{producto.nombre}</h3>
                                            <img
                                                src={papelera}
                                                alt='papelera'
                                                onClick={() => eliminarProducto(producto.producto_id, producto.nombre)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <p>
                                                <span>{producto.precio}€/und x {producto.cantidad} unds = {(producto.precio * producto.cantidad)}€</span>
                                                <img
                                                    src={menos}
                                                    alt='restar'
                                                    onClick={() => decrementarCantidad(producto.producto_id, producto.nombre, producto.cantidad)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <img
                                                    src={mas}
                                                    alt='sumar'
                                                    onClick={() => incrementarCantidad(producto.producto_id, producto.nombre)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <p id='total'>Total: <strong>{productos.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0).toFixed(2)}€</strong></p>
                            <div id='pago'>
                                <div>
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
                                        <button id='comprar'>Comprar</button>
                                    </div>
                                </div>
                            </div>
                        </>)}
                </div>
                <div id='otrosProductos'>
                    <h2>Otros productos</h2>
                    {otrosProductos.length > 0 &&
                        otrosProductos
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
                onConfirm={modal.onConfirm}
            />

        </div>
    )
}
import { useEffect, useState } from 'react';
import papelera from '../assets/Iconos/mdi--rubbish-bin-empty.svg';
import mas from '../assets/Iconos/ic--baseline-plus.svg';
import menos from '../assets/Iconos/ic--baseline-minus.svg';
import paypal from '../assets/Iconos/mingcute--paypal-line.svg';
import google from '../assets/Iconos/devicon--google.svg';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import addCarrito from '../assets/Iconos/tdesign--cart-add.svg';

export default function Carrito() {
    const [productos, setProductos] = useState([]);
    const [otrosProductos, setOtrosProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });
    const navigate = useNavigate();

    const getBackendUrl = () => {
        if (process.env.NODE_ENV === 'production') {
            return process.env.REACT_APP_URL_BACK_NODE;
        }
        return 'http://localhost:4000';
    };

    // Utilidad para obtener la URL base del backend PHP según entorno
    const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "/Proyectos/LvUp_backend/api";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};

    console.log(localStorage.getItem('id_usuario'));
    useEffect(() => {
        console.log(localStorage.getItem('id_usuario'))
        const id_usuario = localStorage.getItem('id_usuario');
        if (!id_usuario) {
            setError("No se ha encontrado el usuario");
            setLoading(false);
            return;
        }
        const token = localStorage.getItem('token');
        console.log(token)
        fetch(`${getPhpBackendUrl()}/obtener_productos_carrito/${id_usuario}`,
            { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                // Filtrar solo productos con estado 'activo'
                const activos = (data.carrito || []).filter(p => p.estado === 'activo');
                setProductos(activos);
                setLoading(false);
            })
            .catch((e) => {
                console.log(e)
                setError("Error al cargar el carrito");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch(`${getPhpBackendUrl()}/obtener_productos`)
            .then(res => res.json())
            .then(data => {
                setOtrosProductos(data.productos || []);
            })
            .catch(() => {
                setOtrosProductos([]);
            });
    }, []);

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
        const token = localStorage.getItem('token');
        fetch(`${getPhpBackendUrl()}/obtener_productos_carrito/${id_usuario}`,
            { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                const activos = (data.carrito || []).filter(p => p.estado === 'activo');
                setProductos(activos);
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
                const token = localStorage.getItem('token');
                fetch(`${getPhpBackendUrl()}/eliminar_producto_carrito/${producto_id}`,
                    { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } })
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

    const incrementarCantidad = async (producto_id, nombre_producto) => {
        const id_usuario = localStorage.getItem('id_usuario');
        const token = localStorage.getItem('token');
        // Buscar el producto en el carrito para saber la cantidad actual
        const productoCarrito = productos.find(p => p.producto_id === producto_id || p.id_producto === producto_id);
        const cantidadActual = productoCarrito ? productoCarrito.cantidad : 0;
        try {
            // Consultar el stock real del producto
            const resStock = await fetch(`${getPhpBackendUrl()}/obtener_stock/${producto_id}`,
                { headers: { 'Authorization': 'Bearer ' + token } });
            const dataStock = await resStock.json();
            console.log(dataStock.stock.stock)
            const stock = dataStock.stock.stock;
            console.log(stock)
            if (stock === null) {
                showModal("Error", "No se pudo obtener el stock actual del producto", "error");
                return;
            }
            console.log(cantidadActual)
            if (cantidadActual >= stock) {
                console.log("Sin stock");
                showModal("Sin stock suficiente", `No puedes añadir más unidades de \"${nombre_producto}\". Stock disponible: ${stock}`, "warning");
                return;
            }
            // Si hay stock suficiente, incrementar
            const res = await fetch(`${getPhpBackendUrl()}/incrementar_carrito`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
                },
                body: `usuario_id=${id_usuario}&producto_id=${producto_id}`
            });
            const data = await res.json();
            if (data.error) {
                showModal("Error", data.error, "error");
            } else {
                recargarCarrito();
            }
        } catch (e) {
            showModal("Error", "Error al comprobar el stock o incrementar la cantidad", "error");
        }
    };

    const decrementarCantidad = (producto_id, nombre_producto, cantidad_actual) => {
        const id_usuario = localStorage.getItem('id_usuario');
        const token = localStorage.getItem('token');
        if (cantidad_actual === 1) {
            showModal(
                "Confirmar eliminación",
                `El producto "${nombre_producto}" tiene cantidad 1. ¿Quieres eliminarlo del carrito?`,
                "confirm",
                () => {
                    fetch(`${getPhpBackendUrl()}/decrementar_carrito`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Bearer ' + token
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
            fetch(`${getPhpBackendUrl()}/decrementar_carrito`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
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
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${getPhpBackendUrl()}/introducir_carrito`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
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

    // Botón de pago: redirige a la pasarela con los datos del carrito
    const handlePagar = () => {
        const productosPasarela = productos.map(p => ({
            id_producto: p.id_producto || p.producto_id,
            nombre: p.nombre,
            precio: p.precio,
            cantidad: p.cantidad,
            subtotal: (p.precio * p.cantidad)
        }));
        const total = productosPasarela.reduce((acc, p) => acc + p.subtotal, 0);
        navigate('/pasarela', {
            state: {
                productos: productosPasarela,
                total: total.toFixed(2),
                fromNavigate: true
            }
        });
    };

    if (loading) return <div id="container"><h2>Cargando carrito...</h2></div>;
    if (error) return <div id="container"><h2>{error}</h2></div>;

    return (
        <div id="container">
            <h2>Esta es tu cesta de la compra</h2>
            <div id="carrito-contenedor-principal">
                <div className="carrito-azul">
                    {productos.length === 0 ? (
                        <h3>Tu carrito está vacío</h3>
                    ) : (
                        <>
                            {productos.map((producto, idx) => (
                                <div key={producto.id_producto || idx} className="producto-carrito">
                                    <div className="producto-carrito-header">
                                        <img src={`${getBackendUrl()}${producto.imagen_url}`} alt='producto_imagen' />                                        <div className="producto-carrito-header-info">
                                            <h3>{producto.nombre}</h3>
                                            <img
                                                id='papelera_icon'
                                                src={papelera}
                                                alt='papelera'
                                                onClick={() => eliminarProducto(producto.producto_id, producto.nombre)}
                                            />
                                            <button id='papeleraBtn' onClick={() => eliminarProducto(producto.producto_id, producto.nombre)}>
                                                Borrar producto
                                            </button>
                                            <p>
                                                <span>{producto.precio}€/und x {producto.cantidad} unds = {(Math.round((producto.precio * producto.cantidad) * 100) / 100)}€</span>
                                                <img
                                                    src={menos}
                                                    alt='restar'
                                                    onClick={() => decrementarCantidad(producto.producto_id, producto.nombre, producto.cantidad)}
                                                />
                                                <img
                                                    src={mas}
                                                    alt='sumar'
                                                    onClick={() => incrementarCantidad(producto.producto_id, producto.nombre)}
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
                                        <button id='comprar' onClick={handlePagar}>Comprar</button>
                                    </div>
                                </div>
                            </div>
                        </>)}
                </div>
                <div id='otrosProductos'>
                    <h2>Otros productos</h2>
                    <div className="productos">
                        {otrosProductos.length > 0 &&
                            otrosProductos
                                .sort(() => Math.random() - 0.5)
                                .slice(0, 4)
                                .map(producto => (
                                    <div key={producto.id_producto} className="tarjeta-producto">
                                        <div className="productos">
                                            <div id='f-line-producto'>
                                                <img src={`${getBackendUrl()}${producto.imagen_url}`}
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
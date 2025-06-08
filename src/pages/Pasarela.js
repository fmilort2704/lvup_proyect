import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

export default function Pasarela() {
    const location = useLocation();
    const precio = location.state?.precio || '';
    const nombreProducto = location.state?.nombre || '';
    const cantidad = location.state?.cantidad || '';
    const carrito = location.state?.productos || null;
    const totalCarrito = location.state?.total || '';
    const [metodoPago, setMetodoPago] = useState('');
    const [dniError, setDniError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [form, setForm] = useState({
        email: '',
        nombre: '',
        apellido: '',
        telefono: '',
        dni: '',
        direccion: '',
        codigoPostal: '',
        provincia: '',
        metodoPago: '',
        numeroTarjeta: ''
    });
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [usarPuntos, setUsarPuntos] = useState(false);
    const [puntosUsuario, setPuntosUsuario] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const navigate = useNavigate();

    const getBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_URL_BACK_NODE;
    }
    return 'http://localhost:4000';
};

const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "/Proyectos/LvUp_backend/api";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};

    useEffect(() => {
        // Obtener puntos del usuario si está logueado
        const id_usuario = localStorage.getItem('id_usuario');
        const token = localStorage.getItem('token');
        if (id_usuario && token) {
            fetch(`${getPhpBackendUrl()}/ver_puntos_usuario/${id_usuario}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data.puntos.puntos)
                    setPuntosUsuario(data.puntos.puntos || 0);
                });
        }
    }, []);

    const totalSinDescuento = carrito && carrito.length > 0 ? Number(totalCarrito) : Number(precio) * Number(cantidad || 1);
    const totalConDescuento = (totalSinDescuento - descuento).toFixed(2);

    function handleUsarPuntos() {
        // Cada punto rebaja 0.01€
        const maxDescuento = Math.min(puntosUsuario * 0.01, totalSinDescuento);
        setDescuento(maxDescuento);
        setUsarPuntos(true);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'metodoPago') setMetodoPago(value);
    }

    function handleDniBlur(e) {
        const dni = e.target.value.toUpperCase();
        // Validación DNI español: 8 dígitos + letra
        const dniRegex = /^\d{8}[A-HJ-NP-TV-Z]$/i;
        if (!dniRegex.test(dni)) {
            setDniError("DNI no válido (formato: 12345678A)");
            return;
        }
        // Comprobar que la letra es la correcta
        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        const numero = dni.substr(0, 8);
        const letra = dni.charAt(8);
        const letraCorrecta = letras.charAt(parseInt(numero, 10) % 23);
        if (letra !== letraCorrecta) {
            setDniError(`La letra del DNI no es correcta. Debería ser: ${letraCorrecta}`);
        } else {
            setDniError("");
        }
    }

    function handleEmailBlur(e) {
        const email = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setEmailError("Email no válido");
        } else {
            setEmailError("");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setModal({ isOpen: false }); // Cierra cualquier modal anterior
        try {
            // Construir el payload para Node
            const payload = {
                ...form,
                productos: carrito,
                total: totalConDescuento,
                nombreProducto,
                precio,
                cantidad
            };
            const res = await fetch(`${getBackendUrl()}/enviar_recibo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            console.log(data.success)
            if (data.success) {
                // --- INSERTAR EN BD: VENTA Y DETALLE ---
                const id_usuario = localStorage.getItem('id_usuario');
                // 1. Obtener el último id_venta y calcular el nuevo id_venta
                let id_venta = null;
                try {
                    const token = localStorage.getItem('token');
                    const resUltimaVenta = await fetch(`${getPhpBackendUrl()}/ultima_venta`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const dataUltimaVenta = await resUltimaVenta.json();
                    if (dataUltimaVenta) {
                        id_venta = parseInt(dataUltimaVenta.id_venta.id_venta, 10) + 1;
                    } else {
                        id_venta = 1; // Si no hay ventas aún
                    }
                } catch (e) {
                    id_venta = 1;
                }
                // 2. Insertar venta principal con id_venta
                let ventaResponse = null;
                const token = localStorage.getItem('token');
                if (carrito && carrito.length > 0) {
                    try {
                        const ventaRes = await fetch(`${getPhpBackendUrl()}/producir_venta`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                            body: JSON.stringify({
                                id_venta,
                                total: totalConDescuento, // aplicar descuento
                                comprador_id: id_usuario,
                            })
                        });
                        ventaResponse = await ventaRes.json();
                    } catch (e) {
                        console.log(e)
                    }

                } else {
                    const ventaRes = await fetch(`${getPhpBackendUrl()}/producir_venta`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                        body: JSON.stringify({
                            id_venta,
                            total: totalConDescuento, // aplicar descuento también en compra individual
                            comprador_id: id_usuario,
                        })
                    });
                    ventaResponse = await ventaRes.json();
                }
                // 3. Insertar detalles de venta con el mismo id_venta
                if (id_venta) {
                    if (carrito && carrito.length > 0) {
                        for (const p of carrito) {
                            await fetch(`${getPhpBackendUrl()}/producir_venta_detalle`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                                body: JSON.stringify({
                                    id_venta,
                                    producto_id: p.id_producto,
                                    cantidad: p.cantidad,
                                    vendedor_id: p.vendedor_id || null
                                })
                            });
                        }
                    } else {
                        await fetch(`${getPhpBackendUrl()}/producir_venta_detalle`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                            body: JSON.stringify({
                                id_venta,
                                producto_id: location.state?.id_producto,
                                cantidad: 1,
                                vendedor_id: location.state?.vendedor_id || null
                            })
                        });
                    }
                }
                // --- FIN INSERTS ---
                // --- ACTUALIZAR PUNTOS USUARIO ---
                if (id_usuario) {
                    const puntosCompra = Math.round(Number(totalConDescuento)); // cada céntimo = 1 punto
                    console.log(puntosCompra)
                    try {
                        // Si se han usado puntos, primero igualar a 0
                        console.log(usarPuntos)
                        if (usarPuntos && puntosUsuario > 0) {
                            console.log("Puntos: " + puntosCompra)
                            await fetch(`${getPhpBackendUrl()}/actualizar_puntos_usuario/${id_usuario}`, {
                                method: 'PUT',
                                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ puntos: puntosCompra })
                            });
                            setPuntosUsuario(puntosCompra);
                        } else {
                            const puntosTotales = puntosUsuario + puntosCompra;
                            console.log("Puntos: " + puntosTotales)
                            // Sumar los puntos generados por la compra
                            await fetch(`${getPhpBackendUrl()}/actualizar_puntos_usuario/${id_usuario}`, {
                                method: 'PUT',
                                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ puntos: puntosTotales })
                            });
                            setPuntosUsuario(puntosTotales)
                        }
                        // Actualizar puntos en frontend

                    } catch (e) {
                        console.log('Error actualizando puntos:', e);
                    }
                }
                // --- FIN ACTUALIZAR PUNTOS USUARIO ---
                setModal({
                    isOpen: true,
                    title: 'Pago realizado',
                    message: 'El recibo ha sido enviado a tu correo electrónico.',
                    type: 'success',
                });
                // Marcar carrito como procesado (puedes ajustar el endpoint según tu backend)
                if (carrito && carrito.length > 0) {
                    if (id_usuario) {
                        fetch(`${getPhpBackendUrl()}/procesar_carrito/${id_usuario}`, {
                            method: 'PUT',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                    }
                }
                setTimeout(() => {
                    navigate('/', { state: { fromNavigate: true } });
                }, 2000);
            } else {
                setModal({
                    isOpen: true,
                    title: 'Error',
                    message: 'No se pudo enviar el recibo. ' + (data.error ? 'Motivo: ' + data.error : 'Inténtalo de nuevo.'),
                    type: 'error'
                });
            }
        } catch (e) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo conectar con el servidor Node. ' + e,
                type: 'error'
            });
        }
    }

    return (
        <div id="container">
            <form className="form-login" onSubmit={handleSubmit}>
                <h2>Resumen de compra</h2>
                <div id='resCompra'>
                    {carrito && carrito.length > 0 ? (
                        <>
                            {carrito.map((p, idx) => (
                                <div key={idx}>{p.nombre} x{p.cantidad} = {p.subtotal.toFixed(2)}€</div>
                            ))}
                            <div>Total: {totalSinDescuento.toFixed(2)}€</div>
                        </>
                    ) : (
                        <>
                            Producto: {nombreProducto}<br />
                            Precio: {precio} €<br />
                            cantidad: {cantidad}
                            <div>Total: {totalSinDescuento.toFixed(2)}€</div>
                        </>
                    )}
                    {/* Botón y resumen de puntos, disponible en ambos casos */}
                    {!usarPuntos && puntosUsuario > 0 && (
                        <button
                            type="button"
                            id='btnPuntos'
                            onClick={handleUsarPuntos}
                        >
                            Usar puntos ({puntosUsuario} disponibles)
                        </button>
                    )}
                    {usarPuntos && (
                        <div style={{ color: 'green', marginBottom: '10px' }}>
                            Descuento aplicado: -{descuento.toFixed(2)}€ ({Math.floor(descuento * 100)} puntos)
                            <br />
                            Nuevo total: {totalConDescuento}€
                        </div>
                    )}
                </div>
                <h2>Datos personales</h2>
                <input type="email" name="email" placeholder="E-mail" value={form.email || ''} onChange={handleChange} onBlur={handleEmailBlur} required />
                {emailError && <div className="email-error email-error-active">{emailError}</div>}
                <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
                <input type="text" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
                <input type="tel" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
                <h2>Documentación de Identificación</h2>
                <input type="text" name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} onBlur={handleDniBlur} required />
                {dniError && <div className="email-error email-error-active">{dniError}</div>}
                <h2>Dirección de facturación</h2>
                <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
                <input type="text" name="codigoPostal" placeholder="Código Postal" value={form.codigoPostal} onChange={handleChange} required />
                <input type="text" name="provincia" placeholder="Provincia" value={form.provincia} onChange={handleChange} required />
                <h2>Método de pago</h2>
                <select name="metodoPago" value={form.metodoPago} onChange={handleChange} required>
                    <option value="">Selecciona un método</option>
                    <option value="tarjeta">Tarjeta de crédito</option>
                    <option value="paypal">PayPal</option>
                    <option value="googlepay">GooglePay</option>
                </select>
                {form.metodoPago === 'tarjeta' && (
                    <input type="text" name="numeroTarjeta" placeholder="Número de la tarjeta" value={form.numeroTarjeta} onChange={handleChange} required />
                )}
                <button id='btnPagar' type="submit" disabled={false}>{'Pagar'}</button>
            </form>
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
}

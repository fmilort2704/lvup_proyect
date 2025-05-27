import { useState } from 'react';
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
    const navigate = useNavigate();

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
                total: totalCarrito,
                nombreProducto,
                precio,
                cantidad
            };
            const res = await fetch('http://localhost:4000/enviar_recibo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setModal({
                    isOpen: true,
                    title: 'Pago realizado',
                    message: 'El recibo ha sido enviado a tu correo electrónico.',
                    type: 'success',
                });
                // Marcar carrito como procesado (puedes ajustar el endpoint según tu backend)
                if (carrito && carrito.length > 0) {
                    const id_usuario = localStorage.getItem('id_usuario');
                    console.log(id_usuario)
                    if (id_usuario) {
                        fetch(`http://localhost/Proyectos/LvUp_backend/api/procesar_carrito/${id_usuario}`, {
                            method: 'PUT',
                        });
                    }
                }
                setTimeout(() => {
                    navigate('/');
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
            <form className="form-login" onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto' }}>
                <h2>Resumen de compra</h2>
                <div style={{marginBottom: '1rem', fontWeight: 'bold'}}>
                    {carrito && carrito.length > 0 ? (
                        <>
                            {carrito.map((p, idx) => (
                                <div key={idx}>{p.nombre} x{p.cantidad} = {p.subtotal.toFixed(2)}€</div>
                            ))}
                            <div>Total: {totalCarrito}€</div>
                        </>
                    ) : (
                        <>
                            Producto: {nombreProducto}<br/>
                            Precio: {precio} €<br/>
                            cantidad: {cantidad}
                        </>
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
                <select name="metodoPago" value={form.metodoPago} onChange={handleChange} required style={{ height: '2.5rem', marginBottom: '.8rem', color: 'black' }}>
                    <option value="">Selecciona un método</option>
                    <option value="tarjeta">Tarjeta de crédito</option>
                    <option value="paypal">PayPal</option>
                    <option value="googlepay">GooglePay</option>
                </select>
                {form.metodoPago === 'tarjeta' && (
                    <input type="text" name="numeroTarjeta" placeholder="Número de la tarjeta" value={form.numeroTarjeta} onChange={handleChange} required />
                )}
                <button type="submit" disabled={false}>{'Pagar'}</button>
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

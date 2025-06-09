import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';


export default function EditarPerfil() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepited, setNewPasswordRepited] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const { login } = useUser();
    const navigate = useNavigate();


    // Para elegir qué campos editar
    const [step, setStep] = useState(1);
    const [editFields, setEditFields] = useState({
        nombre: false,
        email: false,
        password: false
    });

    // Guardar datos actuales del usuario
    const [datosActuales, setDatosActuales] = useState({});

    // Estado para el modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("info");

    // Utilidad para obtener la URL base del backend PHP según entorno
    const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "https://proyecto-backend-rzsf.onrender.com";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};

    useEffect(() => {
        // Obtener datos actuales del usuario al cargar el componente
        const id_usuario = localStorage.getItem('id_usuario');
        if (id_usuario) {
            const token = localStorage.getItem('token');
            fetch(`${getPhpBackendUrl()}/obtener_usuario/${id_usuario}`,
                { headers: { 'Authorization': 'Bearer ' + token } })
                .then(res => res.json())
                .then(data => {
                    if (data.usuario) {
                        setDatosActuales(data.usuario);
                        setNombre(data.usuario.nombre);
                        setEmail(data.usuario.email);
                    }
                });
        }
    }, []);

    function handleFieldChange(e) {
        setEditFields({ ...editFields, [e.target.name]: e.target.checked });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setEmailError("");
        setPasswordError("");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validaciones
        if (editFields.email && !emailRegex.test(email)) {
            setEmailError("Email no válido");
            return;
        }
        if (editFields.password && newPassword && newPassword !== newPasswordRepited) {
            setPasswordError("Las contraseñas nuevas no coinciden");
            return;
        }
        const id_usuario = localStorage.getItem('id_usuario');
        if (!id_usuario) {
            setError("No se ha encontrado el usuario");
            setModalMessage("No se ha encontrado el usuario");
            setModalType("info");
            setModalOpen(true);
            return;
        }
        // Comprobar contraseña antigua
        const emailToCheck = localStorage.getItem('email');
        const loginResult = await login(emailToCheck, oldPassword);
        if (!loginResult.usuario) {
            setError("La contraseña actual no es correcta");
            setModalMessage("La contraseña actual no es correcta");
            setModalType("info");
            setModalOpen(true);
            return;
        }

        // Construir el body solo con los campos seleccionados o actuales
        const body = {};
        body.nombre = localStorage.getItem("nombre");
        body.email = localStorage.getItem('email');
        if (editFields.password) {
            body.contrasenya = newPassword;
        } else {
            body.contrasenya = localStorage.getItem('contrasenya');
        }
        if (editFields.nombre) {
            body.nombre = nombre;
        } else {
            body.nombre = localStorage.getItem('nombre');
        }
        if (editFields.email) {
            body.email = email;
        } else {
            body.email = localStorage.getItem('email');
        }

        fetch(`${getPhpBackendUrl()}/actualizar_usuario/${id_usuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                if (data.mensaje) {
                    setSuccess("Datos actualizados correctamente");
                    setError("");
                    setModalMessage("Datos actualizados correctamente");
                    setModalType("info");
                    setModalOpen(true);
                    localStorage.setItem('nombre', body.nombre);
                    localStorage.setItem('email', body.email);
                    setTimeout(() => {
                        navigate('/', { state:{ fromNavigate: true }});
                    }, 1500);
                } else {
                    setError(data.mensaje || "Error al actualizar el usuario");
                    setSuccess("");
                    setModalMessage(data.mensaje || "Error al actualizar el usuario");
                    setModalType("info");
                    setModalOpen(true);
                }
            })
            .catch((e) => {
                setError("Error de conexión con el servidor: " + e);
                setSuccess("");
                setModalMessage("Error de conexión con el servidor: " + e);
                setModalType("info");
                setModalOpen(true);
            });
    }

    function handleEmailBlur(e) {
        const value = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            setEmailError("Email no válido");
        } else {
            setEmailError("");
        }
    }

    // Paso 1: Selección de campos a editar
    if (step === 1) {
        return (
            <div id="container">
                <h2>¿Qué campos quieres editar?</h2>
                <form className="form-login" onSubmit={e => { e.preventDefault(); setStep(2); }}>
                    <label>
                        <input
                            type="checkbox"
                            name="nombre"
                            checked={editFields.nombre}
                            onChange={handleFieldChange}
                        />
                        Nombre
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="email"
                            checked={editFields.email}
                            onChange={handleFieldChange}
                        />
                        Correo electrónico
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="password"
                            checked={editFields.password}
                            onChange={handleFieldChange}
                        />
                        Contraseña
                    </label>
                    <button type="submit" disabled={
                        !editFields.nombre && !editFields.email && !editFields.password
                    }>
                        Continuar
                    </button>
                </form>
            </div>
        );
    }

    // Paso 2: Formulario de edición
    return (
        <div id="container">
            <FontAwesomeIcon icon={faArrowLeft}
                id='flecha-volver'
                onClick={() => setStep(1)}
            />
            <h2>Editar perfil</h2>
            <form className="form-login" onSubmit={handleSubmit}>
                {editFields.nombre && (
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                    />
                )}
                {editFields.email && (
                    <>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                            onBlur={handleEmailBlur}
                            required
                        />
                        {emailError && <div className="email-error email-error-active">{emailError}</div>}
                    </>
                )}
                {/* Contraseña antigua siempre obligatoria */}
                <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                />
                {editFields.password && (
                    <>
                        <input
                            type="password"
                            placeholder="Contraseña nueva"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setPasswordError(""); }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Repita la contraseña"
                            value={newPasswordRepited}
                            onChange={e => { setNewPasswordRepited(e.target.value); setPasswordError(""); }}
                            onBlur={() => {
                                if (newPassword && newPasswordRepited && newPassword !== newPasswordRepited) {
                                    setPasswordError("Las contraseñas nuevas no coinciden");
                                } else {
                                    setPasswordError("");
                                }
                            }}
                            required
                        />
                        {passwordError && <div className="email-error email-error-active">{passwordError}</div>}
                    </>
                )}
                <button type="submit">Guardar cambios</button>
                {/* Eliminamos mensajes inline, ahora van en modal */}
            </form>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalType === 'info' ? 'Información' : ''}
                message={modalMessage}
                type="info"
            />
        </div>
    );
}
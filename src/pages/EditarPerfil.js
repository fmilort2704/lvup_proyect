import './css/EditarPerfil.css';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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

    // Para elegir qué campos editar
    const [step, setStep] = useState(1);
    const [editFields, setEditFields] = useState({
        nombre: false,
        email: false,
        password: false
    });

    // Guardar datos actuales del usuario
    const [datosActuales, setDatosActuales] = useState({});

    useEffect(() => {
        // Obtener datos actuales del usuario al cargar el componente
        const id_usuario = localStorage.getItem('id_usuario');
        if (id_usuario) {
            fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_usuario/${id_usuario}`)
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
            return;
        }

        // Comprobar contraseña antigua
        const emailToCheck = localStorage.getItem('email');
        const loginResult = await login(emailToCheck, oldPassword);
        console.log(emailToCheck)
        console.log(oldPassword)
        if (!loginResult.usuario) {
            setError("La contraseña actual no es correcta");
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

        console.log(body.nombre)
        console.log(body.email)
        console.log(body.contrasenya)

        fetch(`http://localhost/Proyectos/LvUp_backend/api/actualizar_usuario/${id_usuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                if (data.mensaje) {
                    setSuccess("Datos actualizados correctamente");
                    setError("");
                    localStorage.setItem('nombre', body.nombre);
                    localStorage.setItem('email', body.email);
                } else {
                    setError(data.mensaje || "Error al actualizar el usuario");
                    setSuccess("");
                }
            })
            .catch((e) => {
                setError("Error de conexión con el servidor: " + e);
                setSuccess("");
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
                {error && <div className="email-error email-error-active">{error}</div>}
                {success && <div className="email-success email-error-active">{success}</div>}
            </form>
        </div>
    );
}
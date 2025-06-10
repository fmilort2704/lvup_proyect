import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ojo from '../assets/Iconos/basil--eye-outline.svg';
import ojo_cerradp from '../assets/Iconos/mdi--eye-closed.svg';


export default function InciarSesion({ onLogin }) {
    const [emailError, setEmailError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "/Proyectos/LvUp_backend/api";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};

    function handleSubmit(e) {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("Email no válido");
            return;
        } else {
            setEmailError("");
        }
        setLoading(true);
        setLoginError("");
        fetch(`${getPhpBackendUrl()}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, contrasenya: password })
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.usuario) {
                    // Guarda el id_usuario en LocalStorage
                    localStorage.setItem('id_usuario', data.usuario.id_usuario);
                    localStorage.setItem('nombre', data.usuario.nombre);
                    localStorage.setItem('email', data.usuario.email);
                    localStorage.setItem('puntos', data.usuario.puntos);
                    localStorage.setItem('contrasenya', password)
                    localStorage.setItem('verificado', data.usuario.verificado);
                    console.log(data.usuario.rol);
                    localStorage.setItem('rol', data.usuario.rol);
                    localStorage.setItem('token', data.token);
                    if (onLogin) onLogin();
                    navigate('/', { state:{ fromNavigate: true }});
                } else {
                    setLoginError(data.error || 'Usuario o contraseña incorrectos');
                }
            })
            .catch(() => {
                setLoading(false);
                setLoginError('Error de conexión');
            });
    }

    function handleEmailChange(e) {
        setEmailError("");
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

    function handleCrearCuenta() {
        navigate('/CrearCuenta', { state:{ fromNavigate: true }});
    }

    return (
        <div id='container'>
            <h2>Iniciar sesión</h2>
            <form method="post" className="form-login" onSubmit={handleSubmit}>
                <input placeholder="E-mail" type="email" id="email" name="email" required onChange={handleEmailChange} onBlur={handleEmailBlur} />
                {emailError && <div className={`email-error${emailError ? ' email-error-active' : ''}`}>{emailError}</div>}
                <div className="input-password-wrapper">
                    <input placeholder="Contraseña" type={showPassword ? "text" : "password"} id="password" name="password" required />
                    <img
                        src={showPassword ? ojo_cerradp : ojo}
                        alt={showPassword ? 'ojo cerrado' : 'ojo abierto'}
                        id="icono-ojo-login"
                        tabIndex={0}
                        onClick={() => setShowPassword(v => !v)}
                    />
                </div>
                <div className="botones-login">
                    <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</button>
                    <button type="button" onClick={handleCrearCuenta}>Crear Cuenta</button>
                </div>
                {loginError && <div className="email-error email-error-active">{loginError}</div>}
            </form>
        </div>
    )
}
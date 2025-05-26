import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ojo from '../assets/Iconos/basil--eye-outline.svg';


export default function InciarSesion({ onLogin }) {
    const [emailError, setEmailError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        fetch('http://localhost/Proyectos/LvUp_backend/api/login', {
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
                    if (onLogin) onLogin();
                    navigate('/');
                } else {
                    setLoginError(data.message || 'Usuario o contraseña incorrectos');
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
        navigate('/CrearCuenta');
    }

    return (
        <div id='container'>
            <h2>Iniciar sesión</h2>
            <form method="post" className="form-login" onSubmit={handleSubmit}>
                <input placeholder="E-mail" type="email" id="email" name="email" required onChange={handleEmailChange} onBlur={handleEmailBlur} />
                {emailError && <div className={`email-error${emailError ? ' email-error-active' : ''}`}>{emailError}</div>}
                <div className="input-password-wrapper">
                    <input placeholder="Contraseña" type="password" id="password" name="password" required />
                    <img src={ojo} alt='ojo' className="icono-ojo" tabIndex={0} />
                </div>
                <div className="checkbox-guardar">
                    <input type="checkbox" id="guardar" name="guardar" />
                    <label htmlFor="guardar">Recordar contraseña</label>
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
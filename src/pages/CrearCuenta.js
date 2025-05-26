import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ojo from '../assets/Iconos/basil--eye-outline.svg';import Modal from '../components/Modal';

export default function CrearCuenta() {
    const [emailError, setEmailError] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let valid = true;
        if (!emailRegex.test(email)) {
            setEmailError("Email no válido");
            valid = false;
        } else {
            setEmailError("");
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError("Las contraseñas no coinciden");
            valid = false;
        } else {
            setConfirmPasswordError("");
        }
        if (!valid) return;
        setLoading(true);
        setRegisterError("");
        fetch('http://localhost/Proyectos/LvUp_backend/api/registrarse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: e.target.nombre.value, email: e.target.email.value   , contrasenya: password})
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.mensaje) {
                    setModal({
                        isOpen: true,
                        title: 'Registro exitoso',
                        message: 'El registro fue un éxito',
                        type: 'success'
                    });
                } else {
                    setRegisterError(data.error || 'No se pudo crear la cuenta');
                }
            })
            .catch(() => {
                setLoading(false);
                setRegisterError('Error de conexión');
            });
    }

    function closeModal() {
        setModal({ ...modal, isOpen: false });
        navigate('/login');
    }

    function handleEmailChange() {
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
    function handlePasswordBlur(e) {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password && confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError("Las contraseñas no coinciden");
        } else {
            setConfirmPasswordError("");
        }
    }

    return (
        <div id='container'>
            <h2>Crear cuenta</h2>
            <form method="post" className="form-login" onSubmit={handleSubmit}>
                <input placeholder="Nombre" type="text" id="nombre" name="nombre" required />
                <input placeholder="E-mail" type="email" id="email" name="email" required onChange={handleEmailChange} onBlur={handleEmailBlur} />
                {emailError && <div className={`email-error${emailError ? ' email-error-active' : ''}`}>{emailError}</div>}
                <div className="input-password-wrapper">
                    <input placeholder="Contraseña" type="password" id="password" name="password" required onBlur={handlePasswordBlur} />
                    <img src={ojo} alt='ojo' className="icono-ojo" tabIndex={0} />
                </div>
                <div className="input-password-wrapper">
                    <input placeholder="Confirmar contraseña" type="password" id="confirmPassword" name="confirmPassword" required onBlur={handlePasswordBlur} />
                </div>
                <div className="checkbox-guardar">
                    <input type="checkbox" id="guardar" name="guardar" />
                    <label htmlFor="guardar">Recordar contraseña</label>
                </div>
                {confirmPasswordError && <div className="email-error email-error-active">{confirmPasswordError}</div>}
                <div className="botones-login">
                    <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Crear Cuenta'}</button>
                </div>
                {registerError && <div className="email-error email-error-active">{registerError}</div>}
            </form>
            <p>¿Ya tienes una cuenta? <strong style={{cursor:'pointer'}} onClick={() => navigate('/login')}>Iniciar sesión</strong></p>
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    )
}

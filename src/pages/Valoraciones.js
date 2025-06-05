import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import user_icon from '../assets/Iconos/icono_login.svg';

function getIdUsuario(location) {
    // Prioridad: state, luego query string
    if (location.state?.id_usuario) return location.state.id_usuario;
    const params = new URLSearchParams(location.search);
    return params.get('id_usuario');
}

export default function Valoraciones() {
    const location = useLocation();
    const id_usuario = getIdUsuario(location); // usuario a valorar
    const post = location.state?.post || null;
    const id_post = location.state?.id_post || null;
    const [valoraciones, setValoraciones] = useState([]);
    const [nuevaValoracion, setNuevaValoracion] = useState('');
    const [puntuacion, setPuntuacion] = useState(5);
    const [modal, setModal] = useState({ isOpen: false, message: '', type: 'info' });
    const [loading, setLoading] = useState(true);
    const id_usuario_logueado = localStorage.getItem('id_usuario');
    const navigate = useNavigate();

    useEffect(() => {
        if (!id_usuario) return;
        setLoading(true);
        const token = localStorage.getItem('token');
        fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_valoraciones_usuario/${id_usuario}`,
            { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                setValoraciones(data.valoraciones || []);
                setLoading(false);
            })
            .catch(() => {
                setModal({ isOpen: true, message: 'Error al cargar valoraciones', type: 'error' });
                setLoading(false);
            });
    }, [id_usuario]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!id_usuario_logueado) {
            setModal({ isOpen: true, message: 'Debes iniciar sesión para valorar', type: 'warning' });
            return;
        }
        if (id_usuario_logueado === String(id_usuario)) {
            setModal({ isOpen: true, message: 'No puedes valorarte a ti mismo', type: 'warning' });
            return;
        }
        try {
            let res, data;
            console.log(post);
            if (post) {
                // Valoración de publicación: tras valorar, navegar a posts
                // Obtener puntuacion y numVal actuales de la publicación
                const puntuacionActual = parseFloat(post.puntuacion) || 0;
                const numVal = parseInt(post.numVal) || 0;
                const nuevaMedia = Math.round((puntuacionActual * numVal + puntuacion) / (numVal + 1));
                try {
                    const token = localStorage.getItem('token');
                    await fetch(`http://localhost/Proyectos/LvUp_backend/api/editar_valoracion_publicacion/${post.id_post}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                        body: JSON.stringify({ puntuacion: nuevaMedia, numVal: numVal + 1 })
                    });
                    setModal({ isOpen: true, message: '¡Valoración enviada!', type: 'success' });
                    setTimeout(() => {
                        navigate('/posts', { state: { fromNavigate: true } });
                    }, 2000);
                } catch (e) {
                    console.log(e)
                }
                setPuntuacion(5);
            } else {
                // Valoración de usuario: solo mostrar modal, NO navegar
                if (!nuevaValoracion.trim()) {
                    setModal({ isOpen: true, message: 'La valoración no puede estar vacía', type: 'warning' });
                    return;
                }
                // Valoración normal de usuario
                const token = localStorage.getItem('token');
                res = await fetch('http://localhost/Proyectos/LvUp_backend/api/crear_valoracion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({
                        valorado_id: id_usuario,
                        valorador_id: id_usuario_logueado,
                        comentario: nuevaValoracion,
                        puntuacion
                    })
                });
                data = await res.json();
                if (data.mensaje) {
                    setModal({ isOpen: true, message: '¡Valoración enviada!', type: 'success' });
                    setNuevaValoracion('');
                    setPuntuacion(5);
                    // Recargar valoraciones
                    setLoading(true);
                    fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_valoraciones_usuario/${id_usuario}`,
                        { headers: { 'Authorization': 'Bearer ' + token } })
                        .then(res => res.json())
                        .then(data => {
                            setValoraciones(data.valoraciones || []);
                            setLoading(false);
                        })
                        .catch(() => setLoading(false));
                } else {
                    setModal({ isOpen: true, message: data.error || 'Error al enviar valoración', type: 'error' });
                }
            }
        } catch {
            setModal({ isOpen: true, message: 'Error de red', type: 'error' });
        }
    };

    return (
        <div className="valoraciones-container">
            {post ? (
                <div className="tarjeta_publicaciones valoracion-publicacion-preview" style={{ marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                    <h3>{post.titulo}</h3>
                    <img src={post.img_publicacion} alt="imagen_publicacion" style={{ width: '90%', maxWidth: '200px', height: '110px', objectFit: 'contain', borderRadius: '8px', background: '#fff', margin: '0.5rem auto 1rem auto', display: 'block' }} />
                    <img src={user_icon} alt='icono_usuario' />
                    <span>{post.nombre}</span>
                    <span>{post.descripcion}</span>
                    {localStorage.getItem("id_usuario") && (
                        <form className="form-valoracion" onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                            <h3>Deja tu valoración</h3>
                            <label>Puntuación:
                                <select value={puntuacion} onChange={e => setPuntuacion(Number(e.target.value))}>
                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                                </select>
                            </label>
                            {/* No mostrar textarea de comentario en valoracion de publicacion */}
                            <button type="submit">Enviar valoración</button>
                        </form>
                    )}
                </div>
            ) : (
                <>
                    <h2>Valoraciones del usuario</h2>
                    {loading ? <p>Cargando valoraciones...</p> : (
                        valoraciones.length === 0 ? <p>No hay valoraciones aún.</p> :
                            <ul className="valoraciones-list">
                                {valoraciones.map((v, i) => (
                                    <li key={i} className="valoracion-item">
                                        <div><b>{v.autor_nombre || 'Usuario'}</b> <span style={{ color: '#f5b50a' }}>{'★'.repeat(v.puntuacion)}</span></div>
                                        <div>{v.comentario}</div>
                                    </li>
                                ))}
                            </ul>
                    )}
                    {localStorage.getItem("id_usuario") && (
                        <form className="form-valoracion" onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                            <h3>Deja tu valoración</h3>
                            <label>Puntuación:
                                <select value={puntuacion} onChange={e => setPuntuacion(Number(e.target.value))}>
                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                                </select>
                            </label>
                            <label>Comentario:
                                <textarea value={nuevaValoracion} onChange={e => setNuevaValoracion(e.target.value)} maxLength={300} required rows={3} />
                            </label>
                            <button type="submit">Enviar valoración</button>
                        </form>
                    )}
                </>
            )}
            <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} message={modal.message} type={modal.type} />
        </div>
    );
}

import { useLocation, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import icon_login from '../assets/Iconos/icono_login.svg';
import './css/estilos.css';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

export default function Publicacion() {
    const location = useLocation();
    // Intenta obtener el id_post desde location.state o desde la URL
    const id_post = location.state?.post?.id_post || location.state?.id_post;

    const [post, setPost] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [comentariosLoading, setComentariosLoading] = useState(true);
    const [comentariosError, setComentariosError] = useState(null);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [otrasPublicaciones, setOtrasPublicaciones] = useState([]);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const navigate = useNavigate();

    // Obtener datos de la publicación
    useEffect(() => {
        if (!id_post) return;
        fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_post/${id_post}`)
            .then(res => res.json())
            .then(data => {
                setPost(data.post);
            });
    }, [id_post]);

    // Obtener comentarios
    useEffect(() => {
        if (!id_post) return;
        setComentariosLoading(true);
        fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_comentario_de_post/${id_post}`)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener comentarios');
                return res.json();
            })
            .then(data => {
                setComentarios(Array.isArray(data) ? data : data.comentarios || []);
                setComentariosLoading(false);
            })
            .catch(err => {
                setComentariosError(err.message);
                setComentariosLoading(false);
            });
    }, [id_post]);

    // Obtener otras publicaciones (sin context)
    useEffect(() => {
        fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_posts')
            .then(res => res.json())
            .then(data => {
                // Filtra para no mostrar la publicación actual
                const publicaciones = Array.isArray(data) ? data : data.posts || [];
                setOtrasPublicaciones(publicaciones.filter(p => String(p.id_post) !== String(id_post)));
            });
    }, [id_post]);

    function tiempoTranscurrido(fechaIso) {
        if (!fechaIso) return '';
        const fechaComentario = new Date(fechaIso);
        const ahora = new Date();
        const diffMs = ahora - fechaComentario;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHrs / 24);
        if (diffDias > 0) {
            return diffDias === 1 ? 'Hace 1 día' : `Hace ${diffDias} días`;
        } else if (diffHrs > 0) {
            return diffHrs === 1 ? 'Hace 1 hora' : `Hace ${diffHrs} horas`;
        } else if (diffMin > 0) {
            return diffMin === 1 ? 'Hace 1 minuto' : `Hace ${diffMin} minutos`;
        } else {
            return 'Hace unos segundos';
        }
    }

    // Manejar envío de comentario
    const handleComentar = async () => {
        if (!nuevoComentario.trim()) return;
        const autor_id = localStorage.getItem('id_usuario');
        if (!autor_id || !id_post) return;

        setEnviando(true);
        try {
            const res = await fetch('http://localhost/Proyectos/LvUp_backend/api/crear_comentario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                body: new URLSearchParams({
                    contenido: nuevoComentario,
                    post_id: id_post,
                    autor_id: autor_id
                })
            });
            const data = await res.json();
            if (data && data.success !== false) {
                // Recargar comentarios tras comentar
                setNuevoComentario('');
                setComentariosLoading(true);
                fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_comentario_de_post/${id_post}`)
                    .then(res => res.json())
                    .then(data => {
                        setComentarios(Array.isArray(data) ? data : data.comentarios || []);
                        setComentariosLoading(false);
                    });
            }
        } catch (e) {
            // Puedes mostrar un error si quieres
        }
        setEnviando(false);
    };

    if (!post) {
        return <div id="container">No se encontró la publicación. Accede desde la lista de publicaciones.</div>;
    }

    return (
        <div id="container">
            <div id='cont_publi'>
                <div id='lat_izq'>
                    <div id='info_user'>
                        <img src={icon_login} alt='icono_usuario' />
                        <h2>
                            {post.autor_id ? (
                                <span
                                    className='link'
                                    style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                                    onClick={() => {
                                        if (!localStorage.getItem('id_usuario')) {
                                            setModal({
                                                isOpen: true,
                                                title: 'Acceso restringido',
                                                message: 'Debes registrarte para crear un producto o una publicación',
                                                type: 'warning'
                                            });
                                        } else {
                                            navigate('/Valoraciones', {
                                                state: { id_usuario: post.autor_id, fromNavigate: true }
                                            });
                                        }
                                    }}
                                >
                                    {post.nombre}
                                </span>
                            ) : post.nombre}
                        </h2>
                    </div>
                    <img src={post.img_publicacion} alt='imagen_publicacion' />
                </div>
                <div id='cent'>
                    <div id='info_publicacion'>
                        <h2>{post.titulo}</h2>
                        <h2>Puntuación: ⭐{post.puntuacion}/5</h2>
                        <span>{post.descripcion}</span>
                    </div>
                    <div id='comentario_publicacion'>
                        <input
                            type="text"
                            placeholder="Escriba un comentario"
                            value={nuevoComentario}
                            onChange={e => setNuevoComentario(e.target.value)}
                            disabled={enviando}
                        />
                        <div className="comentario-botones">
                            <button onClick={handleComentar} disabled={enviando || !nuevoComentario.trim()}>
                                Comentar
                            </button>
                            {localStorage.getItem('id_usuario') && localStorage.getItem('id_usuario') !== String(post.autor_id) && (
                                <Link to="/Valoraciones" state={{ post: post, fromNavigate: true }}>
                                    <button className="btn-valoracion">Deja valoración</button>
                                </Link>
                            )}
                        </div>
                    </div>
                    <div id='publicacion_comentarios'>
                        {comentariosLoading ? (
                            <span>Cargando comentarios...</span>
                        ) : comentariosError ? (
                            <span style={{ color: 'red' }}>Error: {comentariosError}</span>
                        ) : comentarios.length === 0 ? (
                            <span>No hay comentarios.</span>
                        ) : (
                            comentarios.map((comentario, idx) => (
                                <div className='comentario' key={comentario.id_comentario || idx}>
                                    <div className="comentario-header">
                                        <img src={icon_login} alt='icono_usuario' />
                                        <h3>{comentario.nombre || 'Anónimo'}</h3>
                                        <span id='tiempo'>{tiempoTranscurrido(comentario.fecha)}</span>
                                    </div>
                                    <div className="comentario-contenido">
                                        {comentario.contenido}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div id='lat_der'>
                    <h2>Otras publicaciones</h2>
                    <div className='publicaciones'>
                        {otrasPublicaciones && otrasPublicaciones.length > 0 ? (
                            otrasPublicaciones.map((p, idx) => (
                                <div className='tarjeta_publicaciones' key={p.id_post || idx} style={{ margin: '1rem 0' }}>
                                    <img src={p.img_publicacion} alt='imagen_publicacion' />
                                    <h3
                                        onClick={() => navigate('/Publicacion', { state: { post: p, fromNavigate: true } })}
                                    >
                                        {p.titulo}
                                    </h3>
                                    <img src={icon_login} alt='icono_usuario' />
                                    <span>{p.nombre}</span>
                                    <span>{p.descripcion}</span>
                                </div>
                            ))
                        ) : (
                            <span>No hay otras publicaciones.</span>
                        )}
                    </div>
                </div>
            </div>
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
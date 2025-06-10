import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icon_login from '../assets/Iconos/icono_login.svg';
import './css/estilos.css';

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getPhpBackendUrl = () => {
        if (process.env.NODE_ENV === 'production') {
            return "/Proyectos/LvUp_backend/api";
        }
        return 'http://localhost/Proyectos/LvUp_backend/api';
    };

    useEffect(() => {
        setLoading(true);
        fetch(`${getPhpBackendUrl()}/obtener_posts`)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener posts');
                return res.json();
            })
            .then(data => {
                setPosts(Array.isArray(data) ? data : data.posts || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div id="container">
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando posts...</p>
            </div>
        </div>
    );
    if (error) return <div id="container">Error: {error}</div>;

    return (
        <div id="container">
            <h2>Publicaciones</h2>
            <div className='publicaciones'>
                {posts.length === 0 ? (
                    <p>No hay posts disponibles.</p>
                ) : (
                    posts.map(post => (
                        <div className='tarjeta_publicaciones' key={post.id_post || post.id}>
                            <img src={`https://backendreactproject-production.up.railway.app${post.img_publicacion}`} alt='imagen_publicacion' onClick={() => navigate('/Publicacion', { state: { post, fromNavigate: true } })}/>
                            <h3
                                onClick={() => navigate('/Publicacion', { state: { post, fromNavigate: true } })}
                            >
                                {post.titulo}
                            </h3>
                            <br />
                            <img src={icon_login} alt='icono_usuario' />
                            <span>{post.nombre}</span>
                            <span>{post.descripcion}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
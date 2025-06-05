import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icon_login from '../assets/Iconos/icono_login.svg';
import './css/estilos.css';
import { usePublicaciones } from '../context/PublicacionesContext';

export default function Posts() {
    const { posts, loading, error } = usePublicaciones();
    const navigate = useNavigate();

    if (loading) return <div id="container">Cargando posts...</div>;
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
                            <img src={post.img_publicacion} alt='imagen_publicacion' />
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
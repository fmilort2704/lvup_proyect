import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

export default function Admin() {
    const [usuarios, setUsuarios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [posts, setPosts] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [adminView, setAdminView] = useState(null); // null: no elegido, 'admin', 'user'
    const navigate = useNavigate();

    // Solo permitir acceso si es admin
    useEffect(() => {
        const rol = localStorage.getItem('rol');
        if (rol === 'admin') {
            setAdminView(null); // Esperar selección
        } else if (rol) {
            setAdminView('user');
            fetchUserData();
        } else {
            setModalMsg('Acceso denegado. Inicia sesión.');
            setModalOpen(true);
        }
    }, []);

    useEffect(() => {
        if (adminView === 'admin') fetchData();
        if (adminView === 'user') fetchUserData();
    }, [adminView]);

    // Para usuarios normales: cargar solo sus datos
    const fetchUserData = async () => {
        setLoading(true);
        const id_usuario = localStorage.getItem('id_usuario');
        if (!id_usuario) {
            setModalMsg('No se encontró el usuario. Vuelve a iniciar sesión.');
            setModalOpen(true);
            setLoading(false);
            return;
        }
        try {
            const [productosRes, postsRes, comentariosRes] = await Promise.all([
                fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_productos_usuarios/${id_usuario}`).then(async r => { const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error('Respuesta inválida del backend en productos: ' + t); } }),
                fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_post_por_usuario/${id_usuario}`).then(async r => { const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error('Respuesta inválida del backend en posts: ' + t); } }),
                fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_comentarios_usuario/${id_usuario}`).then(async r => { const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error('Respuesta inválida del backend en comentarios: ' + t); } }),
            ]);
            setProductos(productosRes.productos || []);
            setPosts(postsRes.posts || []);
            setComentarios(comentariosRes.comentarios || []);
        } catch (err) {
            setModalMsg('Error cargando tus datos: ' + err.message);
            setModalOpen(true);
        }
        setLoading(false);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usuariosRes, productosRes, postsRes, comentariosRes] = await Promise.all([
                fetch('http://localhost/Proyectos/LvUp_backend/api/usuarios').then(r => r.json()),
                fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_productos').then(r => r.json()),
                fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_posts').then(r => r.json()),
                fetch('http://localhost/Proyectos/LvUp_backend/api/comentarios').then(r => r.json()),
            ]);
            console.log(usuariosRes);
            console.log(productosRes);
            console.log(postsRes);
            console.log(comentariosRes);
            setUsuarios(usuariosRes.usuarios);
            setProductos(productosRes.productos);
            setPosts(postsRes.posts);
            setComentarios(comentariosRes.comentarios);
        } catch (err) {
            console.log('Error cargando datos de administración.' + err);
            setModalOpen(true);
        }
        setLoading(false);
    };

    const bloquearUsuario = async (id) => {
        if (!window.confirm('¿Bloquear este usuario permanentemente?')) return;
        try {
            await fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_usuario/${id}`, { method: 'DELETE' });
            setModalMsg('Usuario bloqueado.');
            setModalOpen(true);
            fetchData();
        } catch {
            setModalMsg('Error al bloquear usuario.');
            setModalOpen(true);
        }
    };
    const eliminarProducto = async (id) => {
        if (!window.confirm('¿Eliminar este producto?')) return;
        try {
            await fetch(`http://localhost/Proyectos/LvUp_backend/api/borrar_producto/${id}`, { method: 'DELETE' });
            setModalMsg('Producto eliminado.');
            setModalOpen(true);
            fetchData();
        } catch {
            setModalMsg('Error al eliminar producto.');
            setModalOpen(true);
        }
    };
    const eliminarPost = async (id) => {
        if (!window.confirm('¿Eliminar esta publicación?')) return;
        try {
            await fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_post/${id}`, { method: 'DELETE' });
            setModalMsg('Publicación eliminada.');
            setModalOpen(true);
            fetchData();
        } catch {
            setModalMsg('Error al eliminar publicación.');
            setModalOpen(true);
        }
    };
    const eliminarComentario = async (id) => {
        if (!window.confirm('¿Eliminar este comentario?')) return;
        try {
            await fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_comentario/${id}`, { method: 'DELETE' });
            setModalMsg('Comentario eliminado.');
            setModalOpen(true);
            fetchData();
        } catch {
            setModalMsg('Error al eliminar comentario.');
            setModalOpen(true);
        }
    };

    // Mostrar pantalla de selección aunque loading sea true si adminView === null
    if (localStorage.getItem('rol') === 'admin' && adminView === null) {
        return (
            <div className="admin-panel">
                <h2>¿Qué panel deseas ver?</h2>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', margin: '2rem 0' }}>
                    <button className="admin-btn" onClick={() => setAdminView('admin')}>Panel de administrador</button>
                    <button className="admin-btn" onClick={() => setAdminView('user')}>Mi panel personal</button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="admin-panel"><h2>Cargando...</h2></div>;

    return (
        <div className="admin-panel">
            <h2>Panel de Administración</h2>
            {localStorage.getItem('rol') === 'admin' && adminView === 'admin' ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem' }}>
                        <button className="admin-btn" onClick={() => navigate('/NuevoProducto')}>
                            Crear producto
                        </button>
                    </div>
                    <div className="admin-section">
                        <h3>Usuarios</h3>
                        <ul className="admin-list">
                            {usuarios.map(u => (
                                <li key={u.id_usuario}>
                                    <span>{u.nombre} ({u.email})
                                        {u.bloqueado && <span className="admin-bloqueado">[BLOQUEADO]</span>}
                                    </span>
                                    <div className="admin-actions">
                                        {!u.bloqueado && (
                                            <button className="admin-btn admin-btn-danger" onClick={() => bloquearUsuario(u.id_usuario)}>Bloquear</button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : null}
            <div className="admin-section">
                <h3>Productos</h3>
                <ul className="admin-list">
                    {productos.map(p => (
                        <li key={p.id_producto}>
                            <span>{p.nombre}</span>
                            <div className="admin-actions">
                                {(adminView !== 'admin' || p.estado === 'nuevo') && (
                                    <button className="admin-btn" onClick={() => navigate('/EditarProducto', { state: { producto: p } })}>Editar</button>
                                )}
                                <button className="admin-btn admin-btn-danger" onClick={() => eliminarProducto(p.id_producto)}>Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="admin-section">
                <h3>Publicaciones</h3>
                <ul className="admin-list">
                    {posts.map(post => (
                        <li key={post.id_post}>
                            <span>{post.titulo}</span>
                            <div className="admin-actions">
                                {(adminView !== 'admin') && (
                                    <button className="admin-btn" onClick={() => navigate('/EditarPublicacion', { state: { publicacion: post } })}>Editar</button>
                                )}
                                <button className="admin-btn admin-btn-danger" onClick={() => eliminarPost(post.id_post)}>Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="admin-section">
                <h3>Comentarios</h3>
                <ul className="admin-list">
                    {comentarios.map(c => (
                        <li key={c.id_comentario}>
                            <span>{c.contenido}</span>
                            <div className="admin-actions">
                                <button className="admin-btn admin-btn-danger" onClick={() => eliminarComentario(c.id_comentario)}>Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} message={modalMsg} />
        </div>
    );
}
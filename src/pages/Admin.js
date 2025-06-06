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
    const [adminView, setAdminView] = useState(null);
    const [modalConfirm, setModalConfirm] = useState({ open: false, msg: '', onConfirm: null });
    const navigate = useNavigate();

    // Solo permitir acceso si es admin
    useEffect(() => {
        const rol = localStorage.getItem('rol');
        if (rol === 'admin') {
            setAdminView(null); 
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
            const token = localStorage.getItem('token');
            const [productosRes, postsRes, comentariosRes] = await Promise.all([
                fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_productos_usuarios/${id_usuario}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(async r => { const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error('Respuesta inválida del backend en productos: ' + t); } }),
                fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_post_por_usuario/${id_usuario}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(async r => { const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error('Respuesta inválida del backend en posts: ' + t); } }),
                fetch(`http://localhost/Proyectos/LvUp_backend/api/obtener_comentarios_usuario/${id_usuario}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(async r => { const t = await r.text(); try { return JSON.parse(t); } catch { throw new Error('Respuesta inválida del backend en comentarios: ' + t); } }),
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
            const token = localStorage.getItem('token');
            const [usuariosRes, productosRes, postsRes, comentariosRes] = await Promise.all([
                fetch('http://localhost/Proyectos/LvUp_backend/api/usuarios', {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(r => r.json()),
                fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_productos', {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(r => r.json()),
                fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_posts').then(r => r.json()), // pública
                fetch('http://localhost/Proyectos/LvUp_backend/api/comentarios', {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(r => r.json()),
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
        setModalConfirm({
            open: true,
            msg: '¿Bloquear este usuario permanentemente?',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_usuario/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
                    setModalMsg('Usuario bloqueado.');
                    setModalOpen(true);
                    fetchData();
                } catch {
                    setModalMsg('Error al bloquear usuario.');
                    setModalOpen(true);
                }
                setModalConfirm({ open: false, msg: '', onConfirm: null });
            }
        });
    };
    const eliminarProducto = async (id) => {
        setModalConfirm({
            open: true,
            msg: '¿Eliminar este producto?',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await fetch(`http://localhost/Proyectos/LvUp_backend/api/borrar_producto/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
                    setModalMsg('Producto eliminado.');
                    setModalOpen(true);
                    fetchData();
                } catch {
                    setModalMsg('Error al eliminar producto.');
                    setModalOpen(true);
                }
                setModalConfirm({ open: false, msg: '', onConfirm: null });
            }
        });
    };
    const eliminarPost = async (id) => {
        setModalConfirm({
            open: true,
            msg: '¿Eliminar esta publicación?',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_post/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
                    setModalMsg('Publicación eliminada.');
                    setModalOpen(true);
                    fetchData();
                } catch {
                    setModalMsg('Error al eliminar publicación.');
                    setModalOpen(true);
                }
                setModalConfirm({ open: false, msg: '', onConfirm: null });
            }
        });
    };
    const eliminarComentario = async (id) => {
        setModalConfirm({
            open: true,
            msg: '¿Eliminar este comentario?',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_comentario/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
                    setModalMsg('Comentario eliminado.');
                    setModalOpen(true);
                    fetchData();
                } catch {
                    setModalMsg('Error al eliminar comentario.');
                    setModalOpen(true);
                }
                setModalConfirm({ open: false, msg: '', onConfirm: null });
            }
        });
    };

    // Mostrar pantalla de selección aunque loading sea true si adminView es null
    if (localStorage.getItem('rol') === 'admin' && adminView === null) {
        return (
            <div className="admin-panel">
                <h2>¿Qué panel deseas ver?</h2>
                <div id='botonesAdmin'>
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
                    <div id='ctnCrearProducto' style={{}}>
                        <button className="admin-btn" onClick={() => navigate('/NuevoProducto', { state: { fromAdministracion: true, fromNavigate: true } })}>
                            Crear producto
                        </button>
                    </div>
                </>
            ) : null}
            {localStorage.getItem('rol') !== 'admin' && adminView === 'user' && (
                <div id='ctnBorrarCuenta' style={{ marginBottom: '1.5rem' }}>
                    <button className="admin-btn admin-btn-danger" onClick={() => {
                        setModalConfirm({
                            open: true,
                            msg: '¿Seguro que quieres borrar tu cuenta? Esta acción es irreversible.',
                            onConfirm: async () => {
                                try {
                                    const id_usuario = localStorage.getItem('id_usuario');
                                    await fetch(`http://localhost/Proyectos/LvUp_backend/api/eliminar_usuario/${id_usuario}`, { method: 'DELETE' });
                                    localStorage.clear();
                                    setModalMsg('Cuenta eliminada. ¡Hasta pronto!');
                                    setModalOpen(true);
                                    setTimeout(() => { window.location.href = '/'; }, 2000);
                                } catch {
                                    setModalMsg('Error al eliminar la cuenta.');
                                    setModalOpen(true);
                                }
                                setModalConfirm({ open: false, msg: '', onConfirm: null });
                            }
                        });
                    }}>
                        Borrar cuenta
                    </button>
                </div>
            )}
            {Array.isArray(productos) && productos.length > 0 && (
                <div className="admin-section">
                    <h3>Productos</h3>
                    <ul className="admin-list">
                        {productos.map(p => (
                            <li key={p.id_producto}>
                                <span>{p.nombre}</span>
                                <div className="admin-actions">
                                    {(adminView !== 'admin' || p.estado === 'nuevo') && (
                                        <button className="admin-btn" onClick={() => navigate('/EditarProducto', { state: { producto: p, fromAdministracion: true, fromNavigate: true  } })}>Editar</button>
                                    )}
                                    <button className="admin-btn admin-btn-danger" onClick={() => eliminarProducto(p.id_producto)}>Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {Array.isArray(posts) && posts.length > 0 && (
                <div className="admin-section">
                    <h3>Publicaciones</h3>
                    <ul className="admin-list">
                        {posts.map(post => (
                            <li key={post.id_post}>
                                <span>{post.titulo}</span>
                                <div className="admin-actions">
                                    {(adminView !== 'admin') && (
                                        <button className="admin-btn" onClick={() => navigate('/EditarPublicacion', { state: { publicacion: post, fromNavigate: true  } })}>Editar</button>
                                    )}
                                    <button className="admin-btn admin-btn-danger" onClick={() => eliminarPost(post.id_post)}>Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {Array.isArray(comentarios) && comentarios.length > 0 && (
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
            )}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} message={modalMsg} />
            {modalConfirm.open && (
                <Modal
                    isOpen={modalConfirm.open}
                    onClose={() => setModalConfirm({ open: false, msg: '', onConfirm: null })}
                    message={modalConfirm.msg}
                    onConfirm={modalConfirm.onConfirm}
                    type="confirm"
                />
            )}
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../components/Modal';

export default function EditarPublicacion() {
    const navigate = useNavigate();
    const location = useLocation();
    const publicacion = location.state?.publicacion;

    const [titulo, setTitulo] = useState(publicacion?.titulo || "");
    const [contenido, setContenido] = useState(publicacion?.comentario || "");
    const [descripcion, setDescripcion] = useState(publicacion?.descripcion || "");
    const [imagen, setImagen] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMsg, setModalMsg] = useState("");

    const getBackendUrl = () => {
        if (process.env.NODE_ENV === 'production') {
            return process.env.REACT_APP_URL_BACK_NODE;
        }
        return 'http://localhost:4000';
    };

    const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "/Proyectos/LvUp_backend/api";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};



    console.log(publicacion);

    useEffect(() => {
        if (!publicacion) {
            setModalMsg('No se ha recibido la publicación a editar.');
            setModalOpen(true);
        }
    }, [publicacion]);

    const handleImagenChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!publicacion) return;
        let imagen_url = publicacion.imagen_url;
        // Si se selecciona una nueva imagen, subirla
        if (imagen) {
            // Eliminar la imagen anterior si existe y es diferente
            if (publicacion.imagen_url && publicacion.imagen_url !== '/img_lvup/' + imagen.name) {
                try {
                    await fetch(`${getBackendUrl()}/img_lvup/delete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: publicacion.imagen_url.replace('/img_lvup/', '') })
                    });
                } catch (err) {
                    // No bloquea el flujo, solo loguea
                    console.error('No se pudo eliminar la imagen anterior:', err);
                }
            }
            // Subir la nueva imagen
            const formData = new FormData();
            formData.append('imagen', imagen);
            try {
                const resImg = await fetch(`${getBackendUrl()}/img_lvup/upload`, {
                    method: 'POST',
                    body: formData
                });
                if (resImg.ok) {
                    imagen_url = '/img_lvup/' + imagen.name;
                } else {
                    setModalMsg('Error al subir la imagen.');
                    setModalOpen(true);
                    return;
                }
            } catch (err) {
                setModalMsg('Error de red al subir la imagen.');
                setModalOpen(true);
                return;
            }
        }
        // Actualizar publicación
        const body = {
            id_post: publicacion.id_post,
            titulo,
            descripcion,
            comentario: contenido,
            imagen_url
        };
        try {
            const res = await fetch(`${getPhpBackendUrl()}/actualizar_post/${publicacion.id_post}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                    body: JSON.stringify(body)
                }
            );
            const data = await res.json();
            console.log(data)
            if (data && !data.error) {
                setModalMsg('¡Publicación actualizada con éxito!');
                setModalOpen(true);
                setTimeout(() => {
                    setModalOpen(false);
                    navigate('/Administracion', { state: { fromNavigate: true } });
                }, 1500);
            } else {
                setModalMsg('Error al actualizar la publicación.');
                setModalOpen(true);
            }
        } catch (err) {
            setModalMsg('Error de red o servidor.');
            setModalOpen(true);
        }
    };

    return (
        <div id="container" className="nueva-publicacion-container">
            <h2>Editar publicación</h2>
            <form className="form-publicacion" onSubmit={handleSubmit}>
                <label>Título:
                    <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required maxLength={80} />
                </label>
                <label>Descripción corta:
                    <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} required maxLength={120} />
                </label>
                <label>Contenido:
                    <textarea value={contenido} onChange={e => setContenido(e.target.value)} required rows={6} maxLength={2000} />
                </label>
                <label>Imagen de la publicación:
                    <input type="file" accept="image/*" onChange={handleImagenChange} />
                    {publicacion?.img_publicacion && (
                        <div>
                            <span>Imagen actual:</span><br />
                            <img src={`${getBackendUrl()}${publicacion.img_publicacion}`} alt="imagen_publicacion" height="97" width="79" />
                        </div>
                    )}
                </label>
                <button type="submit" className="btn-principal">Guardar cambios</button>
            </form>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={modalMsg}
            />
        </div>
    );
}
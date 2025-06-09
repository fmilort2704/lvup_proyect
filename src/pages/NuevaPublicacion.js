import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

export default function NuevaPublicacion() {
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const [publicacionCreada, setPublicacionCreada] = useState(false);
    const navigate = useNavigate();

    const getBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_URL_BACK_NODE;
    }
    return 'http://localhost:4000';
};

const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "https://proyecto-backend-rzsf.onrender.com";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};

    const handleImagenChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imagen) return;
        const usuario_id = localStorage.getItem('id_usuario');
        if (!usuario_id) {
            setModalMsg('Debes iniciar sesión para crear una publicación.');
            setModalOpen(true);
            return;
        }
        // 1. Subir imagen al servidor
        const formData = new FormData();
        formData.append('imagen', imagen);
        let imagen_url = '';
        try {
            const resImg = await fetch(`${getBackendUrl()}/img_lvup/upload`, {
                method: 'POST',
                body: formData
            });
            if (resImg.ok) {
                // Espera que el backend devuelva un JSON con la url de la imagen subida
                const imgData = await resImg.json();
                console.log(imgData);
                localStorage.setItem("imgDataUrl", imgData.url)
                localStorage.setItem("imgDataPath", imgData.path)
                if (imgData && imgData.url) {
                    imagen_url = imgData.url;
                } else if (imgData && imgData.path) {
                    imagen_url = imgData.path; // fallback si el backend usa 'path'
                } else {
                    setModalMsg('Error: el servidor no devolvió la URL de la imagen.');
                    setModalOpen(true);
                    return;
                }
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
        // 2. Crear publicación si la imagen se subió correctamente
        if (imagen_url) {
            const body = {
                titulo,
                descripcion,
                comentario: contenido,
                imagen_url,
                autor_id: usuario_id
            };
            try {
                const res = await fetch(`${getPhpBackendUrl()}/crear_post`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (data && data.mensaje) {
                    setModalMsg('¡Publicación creada con éxito!');
                    setModalOpen(true);
                    setPublicacionCreada(true);
                } else {
                    setModalMsg('Error al crear la publicación.');
                    setModalOpen(true);
                }
            } catch (err) {
                setModalMsg('Error de red o servidor.');
                setModalOpen(true);
            }
        }
    };

    // Handler para cerrar el modal
    const handleCloseModal = () => {
        setModalOpen(false);
        if (publicacionCreada) {
            setPublicacionCreada(false);
            navigate('/', { state:{ fromNavigate: true }});
        }
    };

    return (
        <div id="container" className="nueva-publicacion-container">
            <h2>Crear nueva publicación</h2>
            <form className="form-publicacion" onSubmit={handleSubmit} autoComplete="off">
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
                    <input type="file" accept="image/*" onChange={handleImagenChange} required />
                </label>
                <button type="submit" className="btn-principal">Crear publicación</button>
            </form>
            <Modal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                message={modalMsg}
            />
        </div>
    )
}
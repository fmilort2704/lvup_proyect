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
    const navigate = useNavigate();

    const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "/Proyectos/LvUp_backend/api";
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
        let imagenSubida = false;
        try {
            const resImg = await fetch('https://backendreactproject-production.up.railway.app/img_lvup/upload', {
                method: 'POST',
                body: formData
            });
            if (resImg.ok) {
                imagenSubida = true;
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
        if (imagenSubida) {
            const imagen_url = '/img_lvup/' + imagen.name;
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
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `titulo=${titulo}&descripcion=${descripcion}&comentario=${contenido}&imagen_url=${imagen_url}&autor_id=${usuario_id}`
                });
                const data = await res.json();
                if (data) {
                    setModalMsg('¡Publicación creada con éxito!');
                    setModalOpen(true);
                    setTimeout(() => {
                        setModalOpen(false);
                        navigate('/Posts');
                    }, 1500);
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

    return(
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
                    <input type="file" accept="image/*" onChange={handleImagenChange} required />
                </label>
                <button type="submit" className="btn-principal">Crear publicación</button>
            </form>
            <Modal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                message={modalMsg} 
            />
        </div>
    )
}
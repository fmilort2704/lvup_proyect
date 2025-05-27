import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate, useLocation } from 'react-router-dom';

export default function EditarProducto() {
    const navigate = useNavigate();
    const location = useLocation();
    const producto = location.state?.producto;

    const [nombre, setNombre] = useState(producto?.nombre || "");
    const [descripcion, setDescripcion] = useState(producto?.descripcion || "");
    const [descripcionLarga, setDescripcionLarga] = useState(producto?.descripcion_larga || "");
    const [precio, setPrecio] = useState(producto?.precio || "");
    const [imagen, setImagen] = useState(null);
    const [categoria, setCategoria] = useState(producto?.categoria_id ? String(producto.categoria_id) : "");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMsg, setModalMsg] = useState("");

    useEffect(() => {
        if (!producto) {
            setModalMsg('No se ha recibido el producto a editar.');
            setModalOpen(true);
        }
    }, [producto]);

    const handleImagenChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!producto) return;
        let imagen_url = producto.imagen_url;
        // Si se selecciona una nueva imagen, subirla
        if (imagen) {
            // Eliminar la imagen anterior si existe y es diferente
            if (producto.imagen_url && producto.imagen_url !== '/img_lvup/' + imagen.name) {
                try {
                    await fetch('http://localhost:4000/img_lvup/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: producto.imagen_url.replace('/img_lvup/', '') })
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
                const resImg = await fetch('http://localhost:4000/img_lvup/upload', {
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
        // Actualizar producto
        const body = {
            id_producto: producto.id_producto,
            nombre,
            descripcion,
            descripcion_larga: descripcionLarga,
            precio,
            imagen_url,
            categoria_id: categoria
        };
        try {
            const res = await fetch(`http://localhost/Proyectos/LvUp_backend/api/actualizar_producto/${producto.id_producto}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data && !data.error) {
                setModalMsg('¡Producto actualizado con éxito!');
                setModalOpen(true);
                setTimeout(() => {
                    setModalOpen(false);
                    navigate('/Administracion');
                }, 1500);
            } else {
                setModalMsg('Error al actualizar el producto.');
                setModalOpen(true);
            }
        } catch (err) {
            setModalMsg('Error de red o servidor.');
            setModalOpen(true);
        }
    };

    return (
        <div id="container" className="nueva-publicacion-container">
            <h2>Editando producto</h2>
            <form className="form-publicacion" onSubmit={handleSubmit}>
                <label>Nombre:
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required maxLength={80} />
                </label>
                <label>Descripción corta:
                    <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} required maxLength={120} />
                </label>
                <label>Descripción larga:
                    <textarea value={descripcionLarga} onChange={e => setDescripcionLarga(e.target.value)} required rows={6} maxLength={2000} />
                </label>
                <label>Precio (€):
                    <input type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} required />
                </label>
                <label>Imagen del producto:
                    <input type="file" accept="image/*" onChange={handleImagenChange} />
                    {producto?.imagen_url && (
                        <div style={{marginTop: '0.5rem'}}>
                            <span>Imagen actual:</span><br/>
                            <img src={producto.imagen_url} alt="imagen_producto" style={{maxWidth: 120, maxHeight: 120, borderRadius: 8}} />
                        </div>
                    )}
                </label>
                <label>Categoría:
                    <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
                        <option value="">Selecciona una categoría</option>
                        <option value="1">Consolas</option>
                        <option value="2">Videojuegos</option>
                        <option value="3">Accesorios</option>
                        <option value="4">Merchandising</option>
                    </select>
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
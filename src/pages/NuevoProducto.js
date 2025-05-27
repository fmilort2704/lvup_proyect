import { useState } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

export default function NuevoProducto() {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [descripcionLarga, setDescripcionLarga] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState(null);
    const [categoria, setCategoria] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const navigate = useNavigate();

    const handleImagenChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(localStorage.getItem('verificado'))
        if (!imagen) return;
        // Verificado y vendedor desde localStorage
        const verificado = localStorage.getItem('verificado');
        const vendedor_id = localStorage.getItem('id_usuario');
        if (!vendedor_id) {
            setModalMsg('Debes iniciar sesión para crear un producto.');
            setModalOpen(true);
            return;
        }
        // Subir imagen
        const formData = new FormData();
        formData.append('imagen', imagen);
        let imagenSubida = false;
        try {
            const resImg = await fetch('http://localhost:4000/img_lvup/upload', {
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
        // Crear producto si la imagen se subió correctamente
        if (imagenSubida) {
            const imagen_url = '/img_lvup/' + imagen.name;
            const body = {
                nombre,
                descripcion,
                descripcion_larga: descripcionLarga,
                precio,
                imagen_url,
                verificado,
                categoria_id: categoria,
                vendedor_id
            };
            try {
                const res = await fetch('http://localhost/Proyectos/LvUp_backend/api/crear_producto_segunda_mano', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (data) {
                    setModalMsg('¡Producto creado con éxito!');
                    setModalOpen(true);
                    setTimeout(() => {
                        setModalOpen(false);
                        navigate('/');
                    }, 1500);
                } else {
                    setModalMsg('Error al crear el producto.');
                    setModalOpen(true);
                }
            } catch (err) {
                setModalMsg('Error de red o servidor.');
                setModalOpen(true);
            }
        }
    };

    return (
        <div id="container" className="nueva-publicacion-container">
            <h2>Crear nuevo producto</h2>
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
                    <input type="file" accept="image/*" onChange={handleImagenChange} required />
                </label>
                <label>Categoría:
                    <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
                        <option value="">Selecciona una categoría</option>
                        <option value="1">Videojuegos</option>
                        <option value="2">Consolas</option>
                        <option value="3">Accesorios</option>
                        <option value="4">Merchandising</option>
                    </select>
                </label>
                <button type="submit" className="btn-principal">Crear producto</button>
            </form>
            <Modal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                message={modalMsg} 
            />
        </div>
    );
}
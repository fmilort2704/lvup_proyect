import { useState } from 'react';
import Modal from '../components/Modal';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NuevoProducto() {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [descripcionLarga, setDescripcionLarga] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState(null);
    const [categoria, setCategoria] = useState("");
    const [stock, setStock] = useState("");
    const [fechaSalida, setFechaSalida] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [pegi, setPegi] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

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

    // Detectar si viene del panel admin para crear producto nuevo
    const isAdminNuevo = location.state?.fromAdministracion === true;
    console.log(isAdminNuevo);

    const handleImagenChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imagen) return;
        // Verificado y vendedor desde localStorage
        const verificado = localStorage.getItem('verificado');
        const vendedor_id = localStorage.getItem('id_usuario');
        if (!vendedor_id) {
            setModalMsg('Debes iniciar sesión para crear un producto.');
            setModalOpen(true);
            return;
        }
        // Validaciones extra para admin
        if (isAdminNuevo) {
            if (!stock || !fechaSalida || !empresa || !pegi) {
                setModalMsg('Completa todos los campos obligatorios para productos nuevos.');
                setModalOpen(true);
                return;
            }
        }
        // Subir imagen
        const formData = new FormData();
        formData.append('imagen', imagen);
        let imagenSubida = false;
        try {
            const resImg = await fetch(`${getBackendUrl()}/img_lvup/upload`, {
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
            setModalMsg('Error de red al subir la imagen. ' + err);
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
                vendedor_id,
                ...(isAdminNuevo && { stock, fecha_salida: fechaSalida, empresa, pegi })
            };
            try {
                const endpoint = isAdminNuevo
                    ? `${getPhpBackendUrl()}/crear_producto`
                    : `${getPhpBackendUrl()}/crear_producto_segunda_mano`;
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',  'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(body)
                });
                let data;
                try {
                    data = await res.json();
                } catch (jsonErr) {
                    setModalMsg('Respuesta del servidor no es JSON válido.');
                    setModalOpen(true);
                    console.error('Error parseando JSON:', jsonErr);
                    return;
                }
                console.log('Respuesta backend:', data);
                if (res.ok && data && data.mensaje && data.mensaje.includes('creado')) {
                    setModalMsg('¡Producto creado con éxito!');
                    setModalOpen(true);
                    setTimeout(() => {
                        setTimeout(() => {
                            navigate('/', {state:{ fromNavigate: true }});
                        }, 1500);
                    }, 1500);
                } else {
                    setModalMsg(data?.mensaje || data?.error || 'Error al crear el producto.');
                    setModalOpen(true);
                }
            } catch (err) {
                setModalMsg('Error de red o servidor.' + err);
                console.log(err)
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
                {isAdminNuevo && (
                    <>
                        <label>Stock:
                            <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required />
                        </label>
                        <label>Fecha de salida:
                            <input type="date" min="1990-01-01" value={fechaSalida} onChange={e => setFechaSalida(e.target.value)} required />
                        </label>
                        <label>Empresa:
                            <input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} required maxLength={80} />
                        </label>
                        <label>Pegi:
                            <select value={pegi} onChange={e => setPegi(e.target.value)}>
                                <option value="">Selecciona PEGI</option>
                                <option value="3">3</option>
                                <option value="7">7</option>
                                <option value="12">12</option>
                                <option value="16">16</option>
                                <option value="18">18</option>
                            </select>
                        </label>
                    </>
                )}
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
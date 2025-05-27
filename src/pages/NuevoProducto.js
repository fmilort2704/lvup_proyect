import { useState } from 'react';

export default function NuevoProducto() {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [descripcionLarga, setDescripcionLarga] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState(null);
    const [verificado, setVerificado] = useState(false);
    const [categoria, setCategoria] = useState("");

    const handleImagenChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí irá la lógica para enviar el producto al backend
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
        </div>
    );
}
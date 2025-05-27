import { useState, useRef } from 'react';
import logo from '../assets/Iconos/LvUp_icon.svg';
import user from '../assets/Iconos/lucide--user.svg';
import carrito from '../assets/Iconos/prime--cart-arrow-down.svg';
import menu from '../assets/Iconos/material-symbols--menu.svg';
import search from '../assets/Iconos/material-symbols--search-rounded.svg';
import flecha from '../assets/Iconos/weui--arrow-outlined.svg';
import cruz from '../assets/Iconos/akar-icons--cross.svg';
import icon_login from '../assets/Iconos/icono_login.svg';
import './css/Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { useProductos } from '../context/ProductosContext';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filtered, setFiltered] = useState([]);
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    const { productos } = useProductos();

    const isLogged = Boolean(localStorage.getItem('id_usuario'));
    const nombre = localStorage.getItem('nombre');
    const gmail = localStorage.getItem('email');
    const puntos = localStorage.getItem('puntos');

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const toggleSubmenu = () => setSubmenuOpen(!submenuOpen);

    // Animación y focus al abrir
    const handleSearchClick = () => {
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current && searchInputRef.current.focus(), 200);
    };
    // Filtrado en vivo
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (value.trim().length > 0) {
            setFiltered(productos.filter(p => p.nombre.toLowerCase().includes(value.toLowerCase())));
        } else {
            setFiltered([]);
        }
    };
    // Navegar al producto
    const handleSelectProduct = (producto) => {
        setSearchOpen(false);
        setSearchValue('');
        setFiltered([]);
        navigate('/producto', { state: { id_producto: producto.id_producto } });
    };
    // Cerrar búsqueda
    const handleCloseSearch = () => {
        setSearchOpen(false);
        setSearchValue('');
        setFiltered([]);
    };

    return (
        <header className="p-4 bg-blue-600">
            <div id='header'>
                <div id='logo'>
                    <img src={logo} alt="LvUp Logo" className="h-10" />
                    <h1>LvUp</h1>
                </div>
                <div className="header-right">
                    <div id='login' style={{ position: 'relative' }}>
                        {isLogged ? (
                            <>
                                <img
                                    src={icon_login}
                                    alt='user'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowUserMenu(v => !v)}
                                />
                                {showUserMenu && (
                                    <div id='user-menu'>
                                        <div><strong>Nombre: </strong>{nombre}</div>
                                        <div><strong>Gmail: </strong> {gmail}</div>
                                        <div><strong>Puntos: </strong>{puntos}</div>
                                        <div id='botones_perfil'>
                                            <Link to={"/Editar"}
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <button>
                                                    Editar perfil
                                                </button>
                                            </Link>
                                            <button onClick={() => {
                                                localStorage.removeItem('id_usuario');
                                                localStorage.removeItem('nombre');
                                                localStorage.removeItem('email');
                                                localStorage.removeItem('puntos');
                                                setShowUserMenu(false);
                                                window.location.href = '/';
                                            }}>
                                                Cerrar sesión
                                            </button>

                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link to={"/login"}>
                                <img src={user} alt='user' />
                                <span id='s-sesion'>Iniciar sesión</span>
                            </Link>
                        )}
                    </div>
                    <Link to={'/carrito'}>
                        <div id='carrito'>
                            <img src={carrito} alt='carrito' />
                            <span id='s-carrito'>Carrito</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div id='searchBar'>
                <div id='menu'>
                    <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                        <img
                            src={menu}
                            alt='menu'
                            onClick={toggleMenu}
                            className={`menu-icon menu ${menuOpen ? 'slide-out' : 'slide-in'}`}
                            style={{ position: 'absolute' }}
                        />
                        <img
                            src={cruz}
                            alt='cerrar menu'
                            onClick={toggleMenu}
                            className={`menu-icon cruz ${menuOpen ? 'slide-in' : 'slide-out'}`}
                            style={{ position: 'absolute' }}
                        />
                    </div>
                    <ul id='listaMenu' className={menuOpen ? 'menu-open' : ''}>
                        <li onClick={() => { setMenuOpen(false); navigate('/'); }}>Inicio</li>
                        <li onClick={() => { setMenuOpen(false); navigate('/Posts'); }}>Publicaciones</li>
                        <li onClick={() => { setMenuOpen(false); navigate('/NuevaPublicacion'); }}>Crear Publicación</li>
                        <li onClick={() => { setMenuOpen(false); navigate('/NuevoProducto'); }}>Crear Producto</li>
                        <li>
                            Categorias
                            <img
                                src={flecha}
                                alt='flecha'
                                onClick={toggleSubmenu}
                                className={submenuOpen ? 'flecha-rotada' : ''}
                            />
                            <ul id='submenu' className={submenuOpen ? 'submenu-open' : ''}>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Videojuegos' } }); }}>Videojuegos</li>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Consolas' } }); }}>Consolas</li>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Accesorios' } }); }}>Accesorios</li>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Merchandising' } }); }}>Merchandising</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div id='search'>
                    <img src={search} alt='lupa' style={{ cursor: 'pointer' }} onClick={handleSearchClick} />
                    <span id='s-search' onClick={handleSearchClick} style={{ cursor: 'pointer' }}>Buscar</span>
                    {searchOpen && (
                        <div className="search-modal" onClick={handleCloseSearch}>
                            <div className="search-modal-content" onClick={e => e.stopPropagation()}>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    style={{ width: '80%', minWidth: 180, maxWidth: 260, padding: '0.7rem 1rem', borderRadius: 8, border: '1.5px solid #18b6ff', fontSize: '1.1rem', marginBottom: '1rem', outline: 'none', marginRight: '2.5rem' }}
                                />
                                <div style={{ flex: 1, maxHeight: 220, overflowY: 'auto' }}>
                                    {searchValue && filtered.length === 0 && <div style={{ color: '#888' }}>No hay resultados</div>}
                                    {filtered.map(producto => (
                                        <div key={producto.id_producto} style={{ padding: '0.5rem 0', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleSelectProduct(producto)}>
                                            {producto.nombre}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleCloseSearch} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#18b6ff' }}>×</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
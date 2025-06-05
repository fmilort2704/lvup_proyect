import { useState, useRef, useEffect } from 'react';
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
import Modal from './Modal'; // Asegúrate de que la ruta sea correcta

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [modal, setModal] = useState({ isOpen: false });
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
        navigate('/producto', { state: { id_producto: producto.id_producto, fromNavigate: true } });
    };
    // Cerrar búsqueda
    const handleCloseSearch = () => {
        setSearchOpen(false);
        setSearchValue('');
        setFiltered([]);
    };
    // Redirección protegida para crear publicación/producto
    const handleProtectedNavigate = (path) => {
        if (!isLogged) {
            setModal({
                isOpen: true,
                title: 'Acceso restringido',
                message: 'Debes registrarte para crear un producto o una publicación',
                type: 'warning'
            });
            return;
        }
        navigate(path, { state: { fromNavigate: true } });
    };

    useEffect(() => {
        const handleCloseMenus = () => {
            setMenuOpen(false);
            setSubmenuOpen(false);
        };
        window.addEventListener('scroll', handleCloseMenus);
        window.addEventListener('resize', handleCloseMenus);
        return () => {
            window.removeEventListener('scroll', handleCloseMenus);
            window.removeEventListener('resize', handleCloseMenus);
        };
    }, []);

    return (
        <header className="p-4 bg-blue-600">
            <div id='header'>
                <div id='logo' onClick={() => navigate('/', { state: { fromNavigate: true } })}>
                    <img src={logo} alt="LvUp Logo" className="h-10" />
                    <h1>LvUp</h1>
                </div>
                <div className="header-right">
                    <div id='login'>
                        {isLogged ? (
                            <>
                                <img
                                    src={icon_login}
                                    alt='user'
                                    onClick={() => setShowUserMenu(v => !v)}
                                />
                                <span id='s-sesion' onClick={() => setShowUserMenu(v => !v)}>Ver perfil</span>
                                {showUserMenu && (
                                    <div id='user-menu-bg' onClick={() => setShowUserMenu(false)}>
                                        <div id='user-menu' onClick={e => e.stopPropagation()}>
                                            <img src={cruz} alt='cerrar' className='close-modal' onClick={() => setShowUserMenu(false)} />
                                            <div><strong>Nombre: </strong>{nombre}</div>
                                            <div><strong>Gmail: </strong> {gmail}</div>
                                            <div><strong>Puntos: </strong>{puntos}</div>
                                            <div id='botones_perfil'>
                                                <Link to={"/Editar"} state={{ fromNavigate: true }} onClick={() => setShowUserMenu(false) }>
                                                    <button>
                                                        Editar perfil
                                                    </button>
                                                </Link>
                                                <Link to="/Administracion" state={{ fromNavigate: true }} onClick={() => setShowUserMenu(false)}>
                                                    <button>
                                                        Panel Admin
                                                    </button>
                                                </Link>
                                                <button onClick={() => {
                                                    localStorage.removeItem('id_usuario');
                                                    localStorage.removeItem('nombre');
                                                    localStorage.removeItem('email');
                                                    localStorage.removeItem('puntos');
                                                    localStorage.removeItem('verificado');
                                                    localStorage.removeItem('rol');
                                                    setShowUserMenu(false);
                                                    window.location.href = '/';
                                                }}>
                                                    Cerrar sesión
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link to={"/login"} state={{ fromNavigate: true }}>
                                <img src={user} alt='user' />
                                <span id='s-sesion'>Iniciar sesión</span>
                            </Link>
                        )}
                    </div>
                    <Link to={'/carrito'} state={{ fromNavigate: true }}>
                        <div id='carrito'>
                            <img src={carrito} alt='carrito' />
                            <span id='s-carrito'>Carrito</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div id='searchBar'>
                <div id='menu'>
                    <div id='menuCtn'>
                        <img
                            id='menu_icon'
                            src={menu}
                            alt='menu'
                            onClick={toggleMenu}
                            className={`menu-icon menu ${menuOpen ? 'slide-out' : 'slide-in'}`}
                        />
                        <img
                            id='cruz_icon'
                            src={cruz}
                            alt='cerrar menu'
                            onClick={toggleMenu}
                            className={`menu-icon cruz ${menuOpen ? 'slide-in' : 'slide-out'}`}
                        />
                    </div>
                    <ul id='listaMenu' className={menuOpen ? 'menu-open' : ''}>
                        <li onClick={() => { setMenuOpen(false); navigate('/', { state: { fromNavigate: true } }); }}>Inicio</li>
                        <li onClick={() => { setMenuOpen(false); navigate('/Posts', { state: { fromNavigate: true } }); }}>Publicaciones</li>
                        <li onClick={() => { setMenuOpen(false); handleProtectedNavigate('/NuevaPublicacion', { state: { fromNavigate: true } }); }}>Crear Publicación</li>
                        <li onClick={() => { setMenuOpen(false); handleProtectedNavigate('/NuevoProducto', { state: {fromNavigate: true } }); }}>Crear Producto</li>
                        <li>
                            Categorias
                            <img
                                id='flecha_icon'
                                src={flecha}
                                alt='flecha'
                                onClick={toggleSubmenu}
                                className={submenuOpen ? 'flecha-rotada' : ''}
                            />
                            <ul id='submenu' className={submenuOpen ? 'submenu-open' : ''}>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Videojuegos', fromNavigate: true } }); }}>Videojuegos</li>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Consolas', fromNavigate: true } }); }}>Consolas</li>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Accesorios', fromNavigate: true } }); }}>Accesorios</li>
                                <li onClick={() => { setMenuOpen(false); navigate('/', { state: { categoria: 'Merchandising', fromNavigate: true } }); }}>Merchandising</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div id='search'>
                    <img src={search} alt='lupa' onClick={handleSearchClick} />
                    <span id='s-search' onClick={handleSearchClick}>Buscar</span>
                    {searchOpen && (
                        <div className="search-modal" onClick={handleCloseSearch}>
                            <div className="search-modal-content" onClick={e => e.stopPropagation()}>
                                <input
                                    ref={searchInputRef}
                                    id='inputSearch'
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                />
                                <div>
                                    {searchValue && filtered.length === 0 && <div>No hay resultados</div>}
                                    {filtered.map(producto => (
                                        <div key={producto.id_producto} className='productosBuscar' onClick={() => handleSelectProduct(producto)}>
                                            {producto.nombre}
                                        </div>
                                    ))}
                                </div>
                                <button id='cruzBuscar' onClick={handleCloseSearch}>×</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Modal para avisar si no está logueado */}
            <Modal
                isOpen={modal?.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal?.title}
                message={modal?.message}
                type={modal?.type || 'info'}
            />
        </header>
    )
}
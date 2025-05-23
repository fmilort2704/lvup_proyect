import { useState } from 'react';
import logo from '../assets/Iconos/LvUp_icon.svg';
import user from '../assets/Iconos/lucide--user.svg';
import carrito from '../assets/Iconos/prime--cart-arrow-down.svg';
import menu from '../assets/Iconos/material-symbols--menu.svg';
import search from '../assets/Iconos/material-symbols--search-rounded.svg';
import flecha from '../assets/Iconos/weui--arrow-outlined.svg';
import cruz from '../assets/Iconos/akar-icons--cross.svg';
import './css/Header.css';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleSubmenu = () => {
        setSubmenuOpen(!submenuOpen);
    };

    return (
        <header className="p-4 bg-blue-600">
            <div id='header'>
                <div id='logo'>
                    <img src={logo} alt="LvUp Logo" className="h-10" />
                    <h1>LvUp</h1>
                </div>
                <div className="header-right">
                    <div id='login'>
                        <img src={user} alt='user' />
                        <span id='s-sesion'>Iniciar sesión</span>
                    </div>
                    <div id='carrito'>
                        <img src={carrito} alt='carrito' />
                        <span id='s-carrito'>Carrito</span>
                    </div>
                </div>
            </div>
            <div id='searchBar'>
                <div id='menu'>
                    <div style={{ position: 'relative', width: '24px', height: '24px' }}>                        <img 
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
                        <li>
                            Inicio
                        </li>
                        <li>
                            Publicaciones
                        </li>
                        <li>
                            Categorias
                            <img 
                                src={flecha} 
                                alt='flecha' 
                                onClick={toggleSubmenu}
                                className={submenuOpen ? 'flecha-rotada' : ''}
                            />
                            <ul id='submenu' className={submenuOpen ? 'submenu-open' : ''}>
                                <li>Videojuegos</li>
                                <li>Consolas</li>
                                <li>Mandos</li>
                                <li>Merchandising</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div id='search'>
                    <img src={search} alt='lupa'/>
                    <span id='s-search'>Buscar</span>
                </div>
            </div>
        </header>
    )
}
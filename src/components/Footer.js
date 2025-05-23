import React, { useState, useEffect } from 'react';
import twitter from '../assets/Iconos/prime--twitter.svg';
import instagram from '../assets/Iconos/mdi--instagram.svg';
import facebook from '../assets/Iconos/ic--baseline-facebook.svg';
import youtube from '../assets/Iconos/mdi--youtube.svg';
import tiktok from '../assets/Iconos/ic--baseline-tiktok.svg';
import tarjeta from '../assets/Iconos/bytesize--creditcard.svg';
import paypal from '../assets/Iconos/mingcute--paypal-line.svg';
import GooglePay from '../assets/Iconos/cib--google-pay.svg';
import cruz from '../assets/Iconos/akar-icons--cross.svg';
import './css/Footer.css';

export default function Footer() {
    const [modal, setModal] = useState(null);

    const handleOpen = (type) => setModal(type);
    const handleClose = () => setModal(null);

    useEffect(() => {
        if (modal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [modal])

    return (
        <footer id='footer'>
            <div id="redes">
                <h2>Siguenos</h2>
                <ul>
                    <li>
                        <img src={twitter} alt='twitter' />
                        <span id='twitter'>Twitter</span>
                    </li>
                    <li>
                        <img src={instagram} alt='instagram' />
                        <span id='instagram'>Instagram</span>
                    </li>
                    <li>
                        <img src={facebook} alt='facebook' />
                        <span id='facebook'>Facebook</span>
                    </li>
                    <li>
                        <img src={youtube} alt='youtube' />
                        <span id='youtube'>Youtube</span>
                    </li>
                    <li>
                        <img src={tiktok} alt='tiktok' />
                        <span id='tiktok'>TikTok</span>
                    </li>
                </ul>
            </div>
            <div className="footer-bottom">
                <div id='metodos'>
                    <h2>Métodos de pago</h2>
                    <ul className="metodos-pago">
                        <li>
                            <img src={tarjeta} alt='tarjeta' />
                            Tarjeta de crédito
                        </li>
                        <li>
                            <img src={paypal} alt='paypal' />
                            PayPal
                        </li>
                        <li>
                            <img src={GooglePay} alt='googlepay' />
                            GooglePay
                        </li>
                    </ul>
                </div>
                <div id='legal'>
                    <h2>Legal</h2>
                    <ul>
                        <li>
                            <button className="legal-btn" onClick={() => handleOpen('legal')}>Información legal</button>
                        </li>
                        <li>
                            <button className="legal-btn" onClick={() => handleOpen('cookies')}>Políticas de cookies</button>
                        </li>
                    </ul>
                </div>
            </div>
            {modal && (
                <div class="modal-bg" onClick={handleClose}>
                    <div class="modal-content" onClick={e => e.stopPropagation()}>
                        <img src={cruz} class="close-modal" onClick={handleClose} alt='cruz' />
                        {modal === 'cookies' && (
                            <div>
                                <h3>LvUp informa acerca del uso de las cookies en sus páginas web.</h3>
                                <p>
                                    Las cookies son archivos que se pueden descargar en su equipo a través de las páginas web. Son herramientas que tienen un papel esencial para la prestación de numerosos servicios de la sociedad de la información. Entre otros, permiten a una página web almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información obtenida, se pueden utilizar para reconocer al usuario y mejorar el servicio ofrecido. Aceptar el uso de cookies en el “Aviso de Cookies” de la página web de LvUp nos indica su conformidad para hacer uso de nuestros servicios.
                                </p>
                                <h3>Tipos de cookies</h3>
                                <p>Según quien sea la entidad que gestione el dominio desde donde se envían las cookies y trate los datos que se obtengan se pueden distinguir dos tipos: cookies propias y cookies de terceros. Existe también una segunda clasificación según el plazo de tiempo que permanecen almacenadas en el navegador del cliente, pudiendo tratarse de cookies de sesión o cookies persistentes.</p>
                                <div className="botones-footer-modal">
                                    <button className="botonFooter" onClick={handleClose}>Aceptar</button>
                                    <button className="botonFooter" onClick={handleClose}>Rechazar</button>
                                </div>
                            </div>
                        )}
                        {modal === 'legal' && (
                            <div>
                                <h3>Información legal.</h3>
                                <p>
                                    El presente aviso legal regula el uso del Portal de  este Internet, o cualquier otro que en el futuro le sustituyese, que LvUp S.L. (en adelante LvUp) pone a disposición de los usuarios, constituyendo un punto de encuentro de información, productos relacionados con videojuegos retro, coleccionables y nuevas tecnologías, así como otros servicios.
                                    LvUp S.L., tiene su domicilio social en la calle Pixel, número 10, Edificio Retro, 28001 Madrid, España, estando inscrita en el Registro Mercantil de Madrid, Tomo 12.345, Sección 9ª, Libro 0, Folio 45, Hoja nº M-234.567, CIF B12345678. Para comunicaciones legales y organismos e instituciones públicas, contactar con legal@8bitmuseum.com. Para cualquier consulta, duda o incidencia relacionada con los productos y servicios ofrecidos por LvUp, contactar con Atención al Cliente al teléfono 915 67 89 10.
                                    De conformidad con lo previsto en el Reglamento UE 524/2013, de 21 de mayo de 2013, y de la Ley 7/2017, de 2 de noviembre, sobre resolución de litigios en línea en materia de consumo, se inserta a continuación el enlace a la plataforma de resolución de litigios en línea puesta en marcha por la Comisión Europea
                                </p>
                                <div class="botones-footer-modal">
                                    <button class="botonFooter" onClick={handleClose}>Aceptar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </footer>
    )
}
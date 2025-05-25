import React, { useEffect } from 'react';
import cruz from '../assets/Iconos/akar-icons--cross.svg';
import './css/Modal.css';

export default function Modal({ isOpen, onClose, title, message, type = 'info', onConfirm }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-bg" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <img src={cruz} className="close-modal" onClick={onClose} alt='cerrar' />
                <div className="modal-body">
                    {title && <h3>{title}</h3>}
                    <p>{message}</p>
                    <div className="botones-modal">
                        {type === 'confirm' ? (
                            <>
                                <button 
                                    className="boton-modal boton-confirmar" 
                                    onClick={onConfirm}
                                >
                                    Confirmar
                                </button>
                                <button 
                                    className="boton-modal boton-cancelar" 
                                    onClick={onClose}
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <button 
                                className="boton-modal" 
                                onClick={onClose}
                            >
                                Aceptar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { createContext, useContext, useEffect, useState } from 'react';

const PublicacionesContext = createContext();

export function PublicacionesProvider({ children }) {
    const getPhpBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return "https://proyecto-backend-rzsf.onrender.com";
    }
    return 'http://localhost/Proyectos/LvUp_backend/api';
};
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${getPhpBackendUrl()}/obtener_posts`)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener posts');
                return res.json();
            })
            .then(data => {
                setPosts(data.posts);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <PublicacionesContext.Provider value={{ posts, loading, error }}>
            {children}
        </PublicacionesContext.Provider>
    );
}

export function usePublicaciones() {
    return useContext(PublicacionesContext);
}

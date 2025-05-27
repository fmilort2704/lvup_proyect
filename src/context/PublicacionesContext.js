import { createContext, useContext, useEffect, useState } from 'react';

const PublicacionesContext = createContext();

export function PublicacionesProvider({ children }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost/Proyectos/LvUp_backend/api/obtener_posts')
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

import { createContext, useContext } from "react";

export const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    // Función para comprobar login (puedes reutilizarla para comprobar contraseña)
    const login = async (email, password) => {
        const res = await fetch('http://localhost/Proyectos/LvUp_backend/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contrasenya: password })
        });
        return await res.json();
    };

    return (
        <UserContext.Provider value={{ login }}>
            {children}
        </UserContext.Provider>
    );
}
import { useState } from "react";
import api from "../services/api";

function useLogin() {

    const [loading, setLoading] = useState(false);

    async function login(email, password) {

        setLoading(true);

        const response = await api.post("/api/auth/login", {
            email,
            password,
        });

        setLoading(false);

        return response.data;
    }

    return {
        login,
        loading,
    };
}

export default useLogin;
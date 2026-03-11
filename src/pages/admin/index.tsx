import { useState } from "react";
import AdminLogin from "./Login";
import Dashboard from "./Dashboard";

export default function AdminPage() {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem("wachaai_admin_token")
    );

    const handleLogout = () => {
        localStorage.removeItem("wachaai_admin_token");
        setToken(null);
    };

    if (!token) {
        return <AdminLogin onLogin={setToken} />;
    }

    return <Dashboard token={token} onLogout={handleLogout} />;
}

import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type Props = {
    onLogin: (token: string) => void;
};

export default function AdminLogin({ onLogin }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { token } = await api.login(username, password);
            localStorage.setItem("wachaai_admin_token", token);
            onLogin(token);
        } catch {
            setError("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 space-y-5"
            >
                <div className="text-center">
                    <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h1 className="text-xl font-bold">Admin Login</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        WachaAI Music Dashboard
                    </p>
                </div>

                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:border-primary/50 focus:outline-none"
                    />
                </div>

                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:border-primary/50 focus:outline-none"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg text-center">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Sign In
                </button>
            </motion.form>
        </div>
    );
}

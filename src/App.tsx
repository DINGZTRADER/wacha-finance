import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("@/pages/Home"));
const Store = lazy(() => import("@/pages/Store"));
const Commission = lazy(() => import("@/pages/Commission"));
const Download = lazy(() => import("@/pages/Download"));
const Lab = lazy(() => import("@/pages/Lab"));
const Cinematics = lazy(() => import("@/pages/Cinematics"));
const Admin = lazy(() => import("@/pages/admin/index"));
const Contact = lazy(() => import("@/pages/Contact"));

function Loader() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/ai-in-uganda" element={<Home />} />
                    <Route path="/ai-consultancy-uganda" element={<Home />} />
                    <Route path="/chatgpt-uganda" element={<Home />} />
                    <Route path="/ai-automation-kampala" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/lab" element={<Lab />} />
                    <Route path="/cinematics" element={<Cinematics />} />
                    <Route path="/commission" element={<Commission />} />
                    <Route path="/download/:token" element={<Download />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

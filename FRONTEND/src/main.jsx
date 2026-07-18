import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import MentorProvider from "./context/MentorContext";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <NotificationProvider>
                        <MentorProvider>
                            <App />
                            <Toaster
                                position="top-center"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#1e293b',
                                        color: '#f8fafc',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        padding: '12px 18px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
                                    },
                                }}
                            />
                        </MentorProvider>
                    </NotificationProvider>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    </StrictMode>,
)

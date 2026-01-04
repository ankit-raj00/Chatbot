
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ChatPage } from './components/chat/ChatPage';
import { MCPServerManager } from './components/mcp/MCPServerManager';
import { ProfilePage } from './pages/ProfilePage';
import { LandingPage } from './components/home/LandingPage';
import './index.css';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ChatProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route
                                path="/chat"
                                element={
                                    <ProtectedRoute>
                                        <ChatPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/chat/:conversationId"
                                element={
                                    <ProtectedRoute>
                                        <ChatPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/mcp-servers"
                                element={
                                    <ProtectedRoute>
                                        <MCPServerManager />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </BrowserRouter>
                </ChatProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

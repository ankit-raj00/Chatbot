import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ChatPage } from './components/chat/ChatPage';
import { MCPServerManager } from './components/mcp/MCPServerManager';
import { ProfilePage } from './components/user/ProfilePage';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <ChatProvider>
                <BrowserRouter>
                    <Routes>
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
                        <Route path="/" element={<Navigate to="/chat" replace />} />
                    </Routes>
                </BrowserRouter>
            </ChatProvider>
        </AuthProvider>
    );
}

export default App;

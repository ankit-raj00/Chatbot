
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ChatPage } from './components/chat/ChatPage';
import { MCPServerManager } from './components/mcp/MCPServerManager';
import { ProfilePage } from './components/user/ProfilePage';
import { LandingPage } from './components/home/LandingPage';
import { MainLayout } from './components/layout/MainLayout';
import './index.css';

function App() {
    return (
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
                                    <MainLayout>
                                        <ChatPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/chat/:conversationId"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <ChatPage />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/mcp-servers"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <MCPServerManager />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <ProfilePage />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </ChatProvider>
        </AuthProvider>
    );
}

export default App;

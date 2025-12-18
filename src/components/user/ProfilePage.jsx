import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../shared/Navbar';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import api from '../../services/api';

export const ProfilePage = () => {
    const { user } = useAuth();
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchUserMedia();
    }, []);

    const fetchUserMedia = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/media');
            setMedia(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch media:', err);
            setError('Failed to load your media library.');
        } finally {
            setLoading(false);
        }
    };

    const isPdf = (url) => {
        return url?.toLowerCase().endsWith('.pdf');
    };



    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                            <p className="text-gray-500 text-lg">{user?.email}</p>
                            <p className="text-sm text-gray-400 mt-1">Joined {formatDate(user?.created_at || new Date())}</p>
                        </div>
                    </div>
                </div>

                {/* Media Gallery Section */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>My Media Library</span>
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{media.length} items</span>
                </h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : media.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No media yet</h3>
                        <p className="text-gray-500 mt-2">Upload images or files in your chats to see them here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {media.map((item, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer aspect-square bg-gray-100"
                                onClick={() => setSelectedImage(item)}
                            >
                                {isPdf(item.cloudinary_url) ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-gray-500">
                                        <svg className="w-16 h-16 mb-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v-5h2v5zm4 0h-2v-5h2v5zm4 0h-2v-5h2v5z" />
                                            <text x="50%" y="80%" textAnchor="middle" fontSize="3" fill="#666">PDF</text>
                                        </svg>
                                        <p className="text-xs text-center font-medium truncate w-full px-2">{item.original_name}</p>
                                    </div>
                                ) : (
                                    <img
                                        src={item.cloudinary_url}
                                        alt={item.original_name || 'User content'}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                        View
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                                    <p className="text-white text-xs truncate">{item.original_name}</p>
                                    <p className="text-white/80 text-[10px]">{formatDate(item.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {isPdf(selectedImage.cloudinary_url) ? (
                        <div className="w-full h-[90vh] max-w-5xl bg-white rounded-lg shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
                            <iframe
                                src={selectedImage.cloudinary_url}
                                className="w-full h-full rounded-md"
                                title="PDF Viewer"
                            />
                        </div>
                    ) : (
                        <img
                            src={selectedImage.cloudinary_url}
                            alt={selectedImage.original_name}
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}

                    <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                        <a
                            href={selectedImage.cloudinary_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pointer-events-auto inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md transition-colors text-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {isPdf(selectedImage.cloudinary_url) ? 'Download PDF' : 'Open Original'}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

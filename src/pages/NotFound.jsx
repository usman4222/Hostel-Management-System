import React from 'react';

const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="max-w-lg w-full mx-auto p-8 rounded-lg bg-white shadow-lg">
                <div className="text-center">
                    <h1 className="text-6xl text-[#5C53A4] font-semibold mb-4">404</h1>
                    <img src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif" alt="404" className="w-full" />
                    <h2 className="text-2xl text-gray-800 font-semibold mt-4 mb-2">Oops! Page not found</h2>
                    {/* <p className="text-gray-600 mb-4">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p> */}
                    <a href="/" className="inline-block px-4 py-2 bg-[#5C53A4] text-white rounded hover:bg-[#6e65af]">Go to Home</a>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

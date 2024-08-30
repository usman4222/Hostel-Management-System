import React from 'react';
import Spinner from './Spinner';

const DelDialogue = ({ onClose, onConfirm, loading = false }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50" role="dialog" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 id="delete-dialog-title" className="text-xl font-semibold mb-4 text-black">Delete Confirmation</h2>
                <p id="delete-dialog-description" className="mb-6 text-gray-600">Are you sure you want to delete this record?</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 text-black"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DelDialogue;

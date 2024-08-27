import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner'

const EditAttendanceDialog = ({ open, onClose, record, onUpdate }) => {
    const [editedRecord, setEditedRecord] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (record) {
            setEditedRecord(record);
        }
    }, [record]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRecord(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true); 
        await onUpdate(editedRecord);
        setLoading(false); 
    };

    if (!open) return null; 

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4 text-black">Edit Attendance Record</h2>
                {/* <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="date">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={editedRecord.date || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    />
                </div> */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-black" htmlFor="status">Status</label>
                    <input
                        id="status"
                        name="status"
                        type="text"
                        value={editedRecord.status || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-black" htmlFor="reason">Reason</label>
                    <input
                        id="reason"
                        name="reason"
                        type="text"
                        value={editedRecord.reason || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 text-black"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-500  text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditAttendanceDialog;

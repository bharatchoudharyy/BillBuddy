import React, { useState } from 'react';
import api from '../api';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
    const [eventName, setEventName] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!eventName) {
            setError('Event name is required.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/api/events',
                { eventName, currency },
                { headers: { 'x-auth-token': token } }
            );
            onEventCreated(res.data); // Pass the new event back to the dashboard
            onClose(); // Close the modal
            setEventName(''); // Reset form
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Event Name</label>
                        <input
                            type="text"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="e.g., Dinner"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
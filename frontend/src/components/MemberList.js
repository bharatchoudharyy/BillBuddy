import React, { useState } from 'react';
import api from '../api';

const MemberList = ({ eventId, members, onMemberAdded }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            await api.post(
                `/api/events/${eventId}/members`,
                { username },
                { headers: { 'x-auth-token': token } }
            );
            setSuccess(`Successfully added ${username}!`);
            setUsername('');
            onMemberAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add member');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Members ({members.length})</h3>
            <ul className="space-y-2 mb-4">
                {members.map(member => (
                    <li key={member._id} className="p-2 bg-gray-100 rounded">{member.username}</li>
                ))}
            </ul>
            <form onSubmit={handleAddMember} className="space-y-2">
                <h4 className="font-semibold">Add New Member</h4>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-3 py-2 border rounded-lg"
                />
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Add Member</button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
            </form>
        </div>
    );
};

export default MemberList;
import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const PerPersonCostForm = ({ eventId, members, onTransactionAdded }) => {
    const { user: authUser } = useContext(AuthContext);
    const [description, setDescription] = useState('');
    const [splits, setSplits] = useState({}); // { userId: amount }
    const [totalAmount, setTotalAmount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const calculatedTotal = Object.values(splits).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
        setTotalAmount(calculatedTotal);
    }, [splits]);

    const handleSplitChange = (userId, amount) => {
        setSplits(prev => ({ ...prev, [userId]: amount }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const splitDetails = Object.entries(splits)
            .map(([userId, amount]) => ({
                user: userId,
                owes: parseFloat(amount) || 0
            }))
            .filter(split => split.owes > 0);

        if (splitDetails.length === 0) {
            setError("Please enter an amount for at least one person.");
            return;
        }

        const payload = { description, totalAmount, splitDetails };

        try {
            const token = localStorage.getItem('token');
            await api.post(`/api/events/${eventId}/transactions`, payload, { headers: { 'x-auth-token': token } });

            // Reset form
            setDescription('');
            setSplits({});
            onTransactionAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add transaction');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold mb-4">Add New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold text-gray-700">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Printouts for Mid-terms"
                        required
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="space-y-3">
                    <label className="block font-semibold text-gray-700">Enter Cost Per Person</label>
                    {members.map(member => (
                        <div key={member._id} className="grid grid-cols-3 gap-4 items-center">
                            <span className="col-span-1">{member.username}</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={splits[member._id] || ''}
                                onChange={(e) => handleSplitChange(member._id, e.target.value)}
                                // The payer cannot owe themselves in a transaction they paid for.
                                disabled={member.username === authUser.user.username}
                                className="col-span-2 px-3 py-2 border rounded-lg disabled:bg-gray-200"
                                step="0.01"
                            />
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 mt-4 text-right">
                    <span className="font-bold text-lg">Total Amount: {totalAmount.toFixed(2)}</span>
                </div>

                <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 text-lg font-semibold">
                    Add Expense
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </form>
        </div>
    );
};

export default PerPersonCostForm;
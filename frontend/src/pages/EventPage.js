import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import AppLayout from '../components/AppLayout';
import MemberList from '../components/MemberList';
import PerPersonCostForm from '../components/PerPersonCostForm';
import { AuthContext } from '../context/AuthContext';

const TransactionDetailModal = ({ transaction, members, currency, onClose }) => {
    if (!transaction) return null;
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    const memberMap = new Map(members.map(m => [m._id, m.username]));
    const payerName = members.find(m => m._id === transaction.payer)?.username || 'Unknown';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2">{transaction.description}</h2>
                <p className="text-gray-600 mb-4">Paid by {payerName} for a total of {formatCurrency(transaction.totalAmount)}</p>
                <h3 className="text-lg font-semibold mb-2 border-t pt-4">Cost Breakdown:</h3>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {transaction.splitDetails.map((split, index) => (
                        <li key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">Owed by {memberMap.get(split.user)}:</span>
                            <span className="font-semibold">{formatCurrency(split.owes)}</span>
                        </li>
                    ))}
                </ul>
                <button onClick={onClose} className="mt-6 w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400">Close</button>
            </div>
        </div>
    );
};

const EventPage = () => {
    const { eventId } = useParams();
    const { user: authUser } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingTransaction, setViewingTransaction] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };
            const [eventRes, summaryRes] = await Promise.all([
                api.get(`/api/events/${eventId}`, { headers }),
                api.get(`/api/events/${eventId}/summary`, { headers })
            ]);
            setEvent(eventRes.data);
            setSummary(summaryRes.data);
        } catch (err) { setError('Failed to load event data.'); }
        finally { setLoading(false); }
    }, [eventId]);

    useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

    const handleSettleDebt = async (debt) => {
        if (window.confirm(`Are you sure you want to mark the debt of ${formatCurrency(debt.amount, event.currency)} from ${debt.from} as paid?`)) {
            try {
                const token = localStorage.getItem('token');
                await api.post('/api/settlements/settle', {
                    eventId,
                    debtorId: debt.fromId,
                    creditorId: debt.toId,
                    amount: debt.amount
                }, { headers: { 'x-auth-token': token } });
                fetchData();
            } catch (err) {
                alert("Failed to settle debt. You can only settle debts that are owed to you.");
            }
        }
    };

    if (loading) return <AppLayout><div className="text-center">Loading event...</div></AppLayout>;
    if (error) return <AppLayout><div className="text-center text-red-500">{error}</div></AppLayout>;
    if (!event) return <AppLayout><div className="text-center">Event not found.</div></AppLayout>;

    const formatCurrency = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-2">{event.eventName}</h1>
            <p className="text-lg text-gray-600 mb-6">Currency: {event.currency}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">Outstanding Debts</h3>
                        {summary && summary.settlements.length > 0 ? (
                            <ul className="space-y-4">
                                {summary.settlements.map((debt, i) => (
                                    <li key={i} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-red-600">{debt.from}</span>
                                                <span className="font-bold text-gray-500">→</span>
                                                <span className="font-semibold text-green-600">{debt.to}</span>
                                            </div>
                                            <span className="font-bold text-gray-800">
                                                {formatCurrency(debt.amount, event.currency)}
                                            </span>
                                        </div>
                                        {authUser.user.username === debt.to && (
                                            <button
                                                onClick={() => handleSettleDebt(debt)}
                                                className="w-full mt-2 px-3 py-2 text-sm font-bold text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all">
                                                Mark as Paid
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (<p className="text-gray-500">All debts are settled!</p>)}
                    </div>
                    <MemberList eventId={eventId} members={event.members} onMemberAdded={fetchData} />
                </div>
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">Transaction History</h3>
                        <ul className="space-y-2">
                            {event.transactions.length > 0 ? event.transactions.map(tx => (
                                <li key={tx._id} className="border-b py-3 flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold">{tx.description}</span>
                                        <p className="text-sm text-gray-500">Paid by {tx.payer.username}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">{formatCurrency(tx.totalAmount, event.currency)}</span>
                                        <button onClick={() => setViewingTransaction(tx)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">Details</button>
                                    </div>
                                </li>
                            )) : (<p>No transactions have been added yet.</p>)}
                        </ul>
                    </div>
                    <PerPersonCostForm eventId={eventId} members={event.members} onTransactionAdded={fetchData} />
                </div>
            </div>
            <TransactionDetailModal transaction={viewingTransaction} members={event.members} currency={event.currency} onClose={() => setViewingTransaction(null)} />
        </AppLayout>
    );
};

export default EventPage;
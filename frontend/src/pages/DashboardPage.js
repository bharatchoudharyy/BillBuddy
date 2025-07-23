import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import CreateEventModal from '../components/CreateEventModal';

const DashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/api/events', {
                    headers: { 'x-auth-token': token }
                });
                setEvents(res.data);
            } catch (err) {
                console.error('Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleEventCreated = (newEvent) => {
        setEvents([newEvent, ...events]);
    };

    if (loading) {
        return <AppLayout><div className="text-center">Loading...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Events</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600">
                    + Create Event
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {events.length === 0 ? (
                    <p>You have no events. Create one to get started!</p>
                ) : (
                    <ul className="space-y-4">
                        {events.map(event => (
                            <Link to={`/event/${event._id}`} key={event._id} className="block hover:bg-gray-50 rounded-lg">
                                <li className="border p-4 rounded-lg flex justify-between items-center cursor-pointer">
                                    <div>
                                        <p className="text-xl font-semibold text-blue-600">{event.eventName}</p>
                                        <p className="text-sm text-gray-500">
                                            Currency: {event.currency} | Members: {event.members.length}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold capitalize ${event.status === 'settled' ? 'text-green-500' : 'text-gray-700'}`}>
                                            Status: {event.status}
                                        </p>
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ul>
                )}
            </div>

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEventCreated={handleEventCreated}
            />
        </AppLayout>
    );
};

export default DashboardPage;
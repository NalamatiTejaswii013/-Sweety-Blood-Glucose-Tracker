import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        reading_date: new Date().toLocaleDateString("en-CA"),
        time_slot: "Morning",
        glucose_value: ""
    });

    const slots = [
        "Morning",
        "After breakfast",
        "After lunch",
        "After dinner"
    ];

    const fetchReadings = async () => {
        try {
            setLoading(true);

            const response = await api.get("/readings");

            setReadings(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.readings || []
            );

            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load readings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadings();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            reading_date: new Date().toLocaleDateString("en-CA"),
            time_slot: "Morning",
            glucose_value: ""
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        try {
            const payload = {
                reading_date: formData.reading_date,
                time_slot: formData.time_slot,
                glucose_value: Number(formData.glucose_value)
            };

            if (editingId) {
                await api.put(`/readings/${editingId}`, payload);
                setMessage("Reading updated successfully!");
            } else {
                await api.post("/readings", payload);
                setMessage("Reading added successfully!");
            }

            resetForm();
            await fetchReadings();

        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to save reading."
            );
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "";

        const datePart = String(dateValue).slice(0, 10);

        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
        }

        return "";
    };

    const handleEdit = (reading) => {
        setFormData({
            reading_date: formatDate(reading.reading_date),
            time_slot: reading.time_slot,
            glucose_value: reading.glucose_value
        });

        setEditingId(reading.id);
        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this reading?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/readings/${id}`);

            setMessage("Reading deleted successfully!");
            setError("");

            await fetchReadings();

        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to delete reading."
            );
        }
    };

    const total = readings.length;

    const highest = total
        ? Math.max(...readings.map(r => Number(r.glucose_value)))
        : 0;

    const lowest = total
        ? Math.min(...readings.map(r => Number(r.glucose_value)))
        : 0;

    const average = total
        ? (
            readings.reduce(
                (sum, r) => sum + Number(r.glucose_value),
                0
            ) / total
        ).toFixed(1)
        : "0.0";

    return (
        <div className="dashboard-container">

            <div className="dashboard-heading">
                <h1>My Glucose Dashboard 🌸</h1>
                <p>Track your daily blood glucose readings.</p>
            </div>

            <div className="stats-container">

                <div className="stat-card">
                    <h3>Total Readings</h3>
                    <p>{total}</p>
                </div>

                <div className="stat-card">
                    <h3>Highest Reading</h3>
                    <p>{highest} <small>mg/dL</small></p>
                </div>

                <div className="stat-card">
                    <h3>Lowest Reading</h3>
                    <p>{lowest} <small>mg/dL</small></p>
                </div>

                <div className="stat-card">
                    <h3>Average Reading</h3>
                    <p>{average} <small>mg/dL</small></p>
                </div>

            </div>

            <div className="dashboard-card">

                <h2>
                    {editingId ? "Edit Reading" : "Add New Reading"}
                </h2>

                {message && (
                    <p className="success-message">{message}</p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}

                <form className="reading-form" onSubmit={handleSubmit}>

                    <div>
                        <label>Date</label>

                        <input
                            type="date"
                            name="reading_date"
                            value={formData.reading_date}
                            onChange={handleChange}
                            max={new Date().toLocaleDateString("en-CA")}
                            required
                        />
                    </div>

                    <div>
                        <label>Time Slot</label>

                        <select
                            name="time_slot"
                            value={formData.time_slot}
                            onChange={handleChange}
                            required
                        >
                            {slots.map(slot => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Glucose Value (mg/dL)</label>

                        <input
                            type="number"
                            name="glucose_value"
                            value={formData.glucose_value}
                            onChange={handleChange}
                            placeholder="Enter value (40–600)"
                            min="40"
                            max="600"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-buttons">

                        <button type="submit">
                            {editingId ? "Update Reading" : "Add Reading"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>
            </div>

            <div className="dashboard-card">

                <h2>My Glucose Readings</h2>

                {loading ? (
                    <p>Loading readings...</p>

                ) : readings.length === 0 ? (

                    <p>No readings yet. Add your first reading above!</p>

                ) : (

                    <div className="table-wrapper">

                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Glucose Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {readings.map(reading => (

                                    <tr key={reading.id}>

                                        <td>
                                            {formatDate(reading.reading_date)}
                                        </td>

                                        <td>{reading.time_slot}</td>

                                        <td>
                                            {reading.glucose_value} mg/dL
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(reading)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(reading.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>

                                    </tr>

                                ))}
                            </tbody>
                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Dashboard;
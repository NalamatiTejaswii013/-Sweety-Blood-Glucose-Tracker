import { useEffect, useState } from "react";
import api from "../services/api";

function Reports() {
    const [reportType, setReportType] = useState("daily");

    const [date, setDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError("");
            setReport(null);

            const response = await api.get(
                `/reports/${reportType}?date=${date}`
            );

            // Backend sends report details inside response.data.report
            setReport({
                ...response.data.report,
                message: response.data.message
            });

        } catch (err) {
            console.error("Report Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load report. Please try again."
            );

            setReport(null);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (date) {
            fetchReport();
        }
    }, [reportType, date]);

    return (
        <div className="dashboard-container">

            <div className="dashboard-heading">
                <h1>Glucose Reports 📊</h1>
                <p>View and understand your glucose reading history.</p>
            </div>

            <div className="dashboard-card">

                <h2>Select Report</h2>

                <div className="report-filters">

                    <div>
                        <label>Report Type</label>

                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="daily">
                                Daily Report
                            </option>

                            <option value="month-to-date">
                                Month-to-Date Report
                            </option>

                            <option value="previous-month">
                                Previous Month Report
                            </option>
                        </select>
                    </div>

                    <div>
                        <label>Select Date</label>

                        <input
                            type="date"
                            value={date}
                            max={new Date().getFullYear() + "-" +
                                String(new Date().getMonth() + 1).padStart(2, "0") + "-" +
                                String(new Date().getDate()).padStart(2, "0")}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                </div>

            </div>

            {loading && (
                <p>Loading report...</p>
            )}

            {error && (
                <p className="error-message">{error}</p>
            )}

            {!loading && report && (

                <>

                    <div className="dashboard-card">

                        <h2>Report Summary</h2>

                        <p>{report.message}</p>

                        <div className="stats-container">

                            <div className="stat-card">
                                <h3>Total Readings</h3>
                                <p>{report.count ?? 0}</p>
                            </div>

                            <div className="stat-card">
                                <h3>Highest</h3>
                                <p>
                                    {report.highest ?? "-"} mg/dL
                                </p>
                            </div>

                            <div className="stat-card">
                                <h3>Lowest</h3>
                                <p>
                                    {report.lowest ?? "-"} mg/dL
                                </p>
                            </div>

                            <div className="stat-card">
                                <h3>Average</h3>
                                <p>
                                    {report.average ?? "-"} mg/dL
                                </p>
                            </div>

                        </div>

                    </div>

                    {reportType === "daily" && (

                        <div className="dashboard-card">

                            <h2>Daily Reading Details</h2>

                            {report.readings &&
                            report.readings.length > 0 ? (

                                <div className="table-wrapper">

                                    <table>

                                        <thead>
                                            <tr>
                                                <th>Time Slot</th>
                                                <th>Glucose Value</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {report.readings.map((reading) => (

                                                <tr key={reading.id}>
                                                    <td>{reading.time_slot}</td>

                                                    <td>
                                                        {reading.glucose_value} mg/dL
                                                    </td>
                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            ) : (

                                <p>No readings found for this date.</p>

                            )}

                        </div>

                    )}

                </>

            )}

        </div>
    );
}

export default Reports;
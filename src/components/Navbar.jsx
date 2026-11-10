
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    if (!token) {
        return null;
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                🌸 Sweety
            </div>

            <div className="navbar-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/reports">Reports</Link>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;

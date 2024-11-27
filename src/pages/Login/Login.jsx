import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import useSupabase from "../../context/SupabaseContext";

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useSupabase();

    useEffect(() => {
        document.title = "Login - Travel Itineraries";
    }, []);

    useEffect(() => {
        if (user) {
            // Navigate to home page after successful login
            navigate('/', { 
                replace: true, // replace the current page in history
                state: { message: 'Login successful!' } // optional state to pass
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Make sure all fields are entered
        if (!formData.email || !formData.password) {
            setError('All Fields Are Required');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await login({
                email: formData.email,
                password: formData.password
            });

            if (error) throw error;

            // Show the (correct) user data
            console.log(data.user);

            // Clear form data
            setFormData({ email: '', password: '' });
        } catch (err) {
            setError(err.message); // Set the error if authentication fails
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <h2 className="header">Login</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={styles.input}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    type="submit"
                    className={styles.button}
                    disabled={loading}
                >
                    {loading ? 'Logging In...' : 'Login'}
                </button>

                <div className={styles.loginLink}>
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </form>
        </div>
    );
}

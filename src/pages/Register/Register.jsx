import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const supabase = createClient(
    'https://dnchewmkolgjlitgxxui.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuY2hld21rb2xnamxpdGd4eHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNDA4NzcsImV4cCI6MjA0NjkxNjg3N30.YbEkcVK1-m5qen6udcLC9Op3weQA6DD9nygqQ5cvOwo'
  );

  export default function Register() {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Register - Travel Itineraries";
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

    /* Make sure all fields are entered */
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
        setError('All Fields Are Required');
        setLoading(false);
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setError('Passwords Do Not Match');
        setLoading(false);
        return;
    }

    try {

        /* check is email already in use */
        const { data: { users }, error: userCheckError } = await supabase.auth.admin.listUsers();
        const emailExists = users.some(user => user.email === formData.email);
      
      if (emailExists) {
        setError('Email already in use');
        setLoading(false);
        return;
      }

        const {error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    email_confirmed: true,
                    first_name: formData.firstName, 
                    last_name: formData.lastName 
                }
            }
        
        }); 

        if (authError) throw authError;

        // insert
        const { error: insertError} = await supabase
            .from('profile')
            .insert([{
                user_id: supabase.auth.getUser().id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                role: 'traveller',
                profile_status: 'normal'
            }]);

            setFormData({password: '', confirmPassword: '', firstName: '', lastName: '', email: ''});
            setError('Successful Registration! Please Login Now!');

    } catch (err) {
        setError(err.message);
    }   finally {
        setLoading(false);
    }
};



return (
    <div className={styles.register}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={styles.input}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    type="submit"
                    className={styles.button}
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>

                <div className={styles.loginLink}>
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </form>
        </div>
);
}



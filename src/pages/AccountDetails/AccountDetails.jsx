import React, { useEffect, useState, useRef } from "react";
import styles from './accountdetails.module.css';
import useSupabase from "../../context/SupabaseContext";

export default function AccountDetails() {
  const { user, supabase } = useSupabase();
  
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [activeNameSubmission, setActiveNameSubmission] = useState(null);
  const [activeEmailSubmission, setActiveEmailSubmission] = useState(null);

  const passwordRef = useRef();

  useEffect(() => {
    if (user) {
      setCurrentEmail(user.email);
      fetchUserProfile();
    } else {
      setCurrentEmail('');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      }
    } catch (err) {
      setError('Error fetching profile: ' + err.message);
    }
  };

  const handleUpdateNameCredentials = async (e) => {
    e.preventDefault();
    setActiveNameSubmission('updating');
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profile')
        .upsert([
          {
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
          }
        ]);

      if (error) {
        setError('Error updating name credentials: ' + error.message);
        return;
      }

      // Update display_name in auth system
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          display_name: `${firstName} ${lastName}`.trim()
        }
      });

      if (updateUserError) {
        setError('Error updating display name: ' + updateUserError.message);
        return;
      }

      setSuccess('Name credentials and display name successfully updated.');
    } catch (err) {
      setError('Unexpected error occurred: ' + err.message);
    } finally {
      setActiveNameSubmission(null);
    }
  };

  const handleUpdateEmailPassword = async (e) => {
    e.preventDefault();
    setActiveEmailSubmission('updating');
    setError('');
    setSuccess('');
    
    if (!newEmail && !password) {
      setError('Please enter at least one field to update.');
      setActiveEmailSubmission(null);
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      setActiveEmailSubmission(null);
      return;
    }

    try {
      const updates = {};

      if (newEmail) {
        updates.email = newEmail;
      }
      if (password) {
        updates.password = password;
      }

      const { error: userError } = await supabase.auth.updateUser(updates);

      if (userError) {
        setError('Error updating email or password: ' + userError.message);
      } else {
        if (newEmail) {
          setSuccess('Confirmation email sent! Please confirm via the link to save email update.');
          setCurrentEmail(newEmail); 
          setNewEmail(''); 
        }

        if (password) {
          setSuccess(prev => prev ? prev + ' Password successfully updated.' : 'Password successfully updated.');
          setPassword(''); 
          setConfirmPassword(''); 
          passwordRef.current.focus(); 
        }
      }
    } catch (err) {
      setError('Unexpected error occurred: ' + err.message);
    } finally {
      setActiveEmailSubmission(null);
    }
  };

  return (
    <div className={styles.account}>
      <h2>Manage Account Details</h2>

      {user ? (
        <div>
          <form onSubmit={handleUpdateNameCredentials} className={styles.form}>
            <div>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={firstName || "Enter your first name"}
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={lastName || "Enter your last name"}
              />
            </div>
            <button 
              type="button" 
              disabled={activeNameSubmission === 'updating'}
              onClick={handleUpdateNameCredentials}
            >
              {activeNameSubmission === 'updating' ? 'Updating Name...' : 'Save Name Credentials'}
            </button>
          </form>

          <form onSubmit={handleUpdateEmailPassword} className={styles.form}>
            <div>
              <label htmlFor="newEmail">Email Address:</label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}  
                placeholder={currentEmail}
              />
            </div>
            <div>
              <label htmlFor="password">New Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ref={passwordRef}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <button 
              type="button" 
              disabled={activeEmailSubmission === 'updating'}
              onClick={handleUpdateEmailPassword}
            >
              {activeEmailSubmission === 'updating' ? 'Updating Email & Password...' : 'Save Email & Password'}
            </button>
          </form>

          <div>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
          </div>
        </div>
      ) : (
        <div>
          <p>Please log in to manage your account details.</p>
        </div>
      )}
    </div>
  );
}
/**
 * UserDatabase.jsx
 *
 * Web-based user management interface (Admin only)
 * Replaces the PyQt5 GUI from UV_systems_Calculator/UserDatabase. py
 *
 * Features:
 * - List all users in a table
 * - Add new users
 * - Edit existing users
 * - Delete users
 * - Role-based access (Admin only)
 * - Backend authentication via headers
 * - Sortable columns (Username, Role, Expiration Date)
 * - Scrollable table
 */

import React, { useState, useEffect } from 'react';
import '../Styles/UserDatabase.css';
import config from '../../config.json';

const API_BASE_URL = config.API_BASE_URL;

const UserDatabase = ({ appState, onBack }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'Marketing',
        expirationDate:  formatDate(new Date())
    });

    const roles = ['Marketing', 'Developer', 'Admin'];

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date. getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function parseDate(dateStr) {
        // Parse "dd-MMM-yyyy" format to Date object
        const parts = dateStr.split('-');
        const day = parseInt(parts[0]);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames. indexOf(parts[1]);
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
    }

    function dateToInputValue(dateStr) {
        // Convert "dd-MMM-yyyy" to "yyyy-MM-dd" for input[type="date"]
        const date = parseDate(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Sorting function
    const sortData = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedUsers = [...users].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];

            // Handle expiration date sorting
            if (key === 'Expiration Date') {
                aVal = parseDate(aVal);
                bVal = parseDate(bVal);
            } else {
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            }

            if (aVal < bVal) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aVal > bVal) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setUsers(sortedUsers);
    };

    // Get CSS class for sort indicator
    const getSortClass = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc';
    };

    // Get authentication headers for API requests
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'X-Username': appState?. username || '',
            'X-Password': appState?.password || ''
        };
    };

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/users/`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            if (response.status === 403 || response.status === 401) {
                setError('Access denied:  Admin privileges required');
                return;
            }

            if (data.status === 'success') {
                setUsers(data.users);
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users:  ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Add user
    const handleAddUser = async () => {
        if (!formData.username. trim() || !formData.password.trim()) {
            alert('Please enter valid Username and Password');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    UserName: formData.username,
                    Password: formData.password,
                    Role: formData.role,
                    'Expiration Date': formData. expirationDate
                })
            });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setShowAddModal(false);
                resetForm();
                await fetchUsers();
                alert(data.message);
            } else {
                alert(data.detail || 'Failed to add user');
            }
        } catch (err) {
            console.error('Error adding user:', err);
            alert('Failed to add user:  ' + err.message);
        }
    };

    // Update user
    const handleUpdateUser = async () => {
        if (!formData.username.trim() || !formData.password.trim()) {
            alert('Please enter valid Username and Password');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${selectedUser. UserName}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    UserName: formData.username,
                    Password: formData.password,
                    Role: formData. role,
                    'Expiration Date': formData.expirationDate
                })
            });
            const data = await response. json();

            if (response. ok && data.status === 'success') {
                setShowEditModal(false);
                setSelectedUser(null);
                resetForm();
                await fetchUsers();
                alert(data.message);
            } else {
                alert(data.detail || 'Failed to update user');
            }
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user: ' + err. message);
        }
    };

    // Delete user
    const handleDeleteUser = async () => {
        if (! selectedUser) {
            alert('No User selected');
            return;
        }

        if (! window.confirm('Are you sure? ')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${selectedUser.UserName}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setSelectedUser(null);
                await fetchUsers();
                alert(data.message);
            } else {
                alert(data.detail || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            username:  '',
            password: '',
            role: 'Marketing',
            expirationDate: formatDate(new Date())
        });
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = () => {
        if (! selectedUser) {
            alert('No User selected');
            return;
        }
        setFormData({
            username: selectedUser.UserName,
            password: selectedUser.Password,
            role: selectedUser.Role,
            expirationDate: selectedUser['Expiration Date']
        });
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="user-database">
                <div className="loading-container">
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-database">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchUsers}>Retry</button>
                    {onBack && <button onClick={onBack}>Back to Calculator</button>}
                </div>
            </div>
        );
    }

    return (
        <div className="user-database">
            {/* Main Container - matches App.jsx structure */}
            <div id="flex-container">
                {/* Top Banner */}
                <a href="https://www.atlantium.com" target="_blank" rel="noopener noreferrer">
                    <img id="atlantium-img" src="/AtlantiumLogo_Long.png" alt="Atlantium Logo" />
                </a>

                {/* Header */}
                <div className="user-db-header">
                    {onBack && (
                        <button className="back-button" onClick={onBack}>
                            ← Back to Calculator
                        </button>
                    )}
                    <h2>User Database Management</h2>
                    <div className="user-info">
                        Logged in as: <strong>{appState?.username}</strong> ({appState?.role})
                    </div>
                </div>

                {/* Users Table */}
                <div className="table-container">
                <table className="users-table">
                    <thead>
                    <tr>
                        <th
                            onClick={() => sortData('UserName')}
                            className={`sortable ${getSortClass('UserName')}`}
                        >
                            UserName
                        </th>
                        <th>Password</th>
                        <th
                            onClick={() => sortData('Role')}
                            className={`sortable ${getSortClass('Role')}`}
                        >
                            Role
                        </th>
                        <th
                            onClick={() => sortData('Expiration Date')}
                            className={`sortable ${getSortClass('Expiration Date')}`}
                        >
                            Expiration Date
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="no-data">No users found</td>
                        </tr>
                    ) : (
                        users.map((user, index) => (
                            <tr
                                key={index}
                                className={selectedUser?.UserName === user.UserName ? 'selected' : ''}
                                onClick={() => setSelectedUser(user)}
                            >
                                <td>{user.UserName}</td>
                                <td>{user.Password}</td>
                                <td>{user.Role}</td>
                                <td>{user['Expiration Date']}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
                <button className="btn-add" onClick={openAddModal}>
                    Add User
                </button>
                <button
                    className="btn-edit"
                    onClick={openEditModal}
                    disabled={!selectedUser}
                >
                    Change Parameters
                </button>
                <button
                    className="btn-delete"
                    onClick={handleDeleteUser}
                    disabled={!selectedUser}
                >
                    Remove User
                </button>
                <button className="btn-exit" onClick={onBack}>
                    Exit
                </button>
            </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Add User</h3>
                        <div className="form-group">
                            <label>UserName:</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e. target.value })}
                                placeholder="Enter username"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ... formData, password: e.target.value })}
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="form-group">
                            <label>Role:</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ... formData, role: e.target.value })}
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Expiration Date:</label>
                            <input
                                type="date"
                                defaultValue={dateToInputValue(formData.expirationDate)}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData({ ...formData, expirationDate: formatDate(date) });
                                }}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button className="btn-primary" onClick={handleAddUser}>
                                Add User
                            </button>
                            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Update User Parameters</h3>
                        <div className="form-group">
                            <label>UserName:</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e. target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="text"
                                value={formData. password}
                                onChange={(e) => setFormData({ ...formData, password: e.target. value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Role: </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Expiration Date:</label>
                            <input
                                type="date"
                                defaultValue={dateToInputValue(formData.expirationDate)}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFormData({ ...formData, expirationDate: formatDate(date) });
                                }}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button className="btn-primary" onClick={handleUpdateUser}>
                                Update User
                            </button>
                            <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDatabase;
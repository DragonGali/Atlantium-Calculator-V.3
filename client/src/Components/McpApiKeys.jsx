/**
 * McpApiKeys.jsx
 *
 * Admin-only interface for managing MCP (Model Context Protocol) API keys.
 * Keys allow LLM agents (Claude, GPT, etc.) to access the UV calculator
 * through the MCP server's SSE transport.
 *
 * Features:
 * - List all keys (shows only preview of last 8 chars)
 * - Generate new keys (full key shown once on creation)
 * - Toggle keys active / inactive
 * - Delete (revoke) keys
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../Styles/McpApiKeys.css';
import config from '../../config.json';

const API_BASE_URL = config.API_BASE_URL;

const McpApiKeys = ({ appState }) => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState(null);   // full key shown once
    const [copied, setCopied] = useState(false);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'X-Username': appState?.username || '',
        'X-Password': appState?.password || '',
    });

    // ── Fetch keys ─────────────────────────────────────────────────────

    const fetchKeys = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const resp = await fetch(`${API_BASE_URL}/mcp/api-keys/`, {
                headers: getAuthHeaders(),
            });
            const data = await resp.json();

            if (resp.status === 403 || resp.status === 401) {
                setError('Access denied: Admin privileges required');
                return;
            }
            if (data.status === 'success') {
                setKeys(data.keys);
            } else {
                setError('Failed to fetch API keys');
            }
        } catch (err) {
            setError('Failed to fetch API keys: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [appState]);

    useEffect(() => { fetchKeys(); }, [fetchKeys]);

    // ── Create key ─────────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!newKeyName.trim()) {
            alert('Please enter a name for the API key');
            return;
        }
        try {
            const resp = await fetch(`${API_BASE_URL}/mcp/api-keys/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name: newKeyName.trim() }),
            });
            const data = await resp.json();
            if (resp.ok && data.status === 'success') {
                setCreatedKey(data.key);
                setCopied(false);
                setNewKeyName('');
                await fetchKeys();
            } else {
                alert(data.detail || 'Failed to create API key');
            }
        } catch (err) {
            alert('Failed to create API key: ' + err.message);
        }
    };

    // ── Toggle active ──────────────────────────────────────────────────

    const handleToggle = async (keyId) => {
        try {
            const resp = await fetch(`${API_BASE_URL}/mcp/api-keys/${keyId}/toggle`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });
            const data = await resp.json();
            if (resp.ok && data.status === 'success') {
                await fetchKeys();
            } else {
                alert(data.detail || 'Failed to toggle API key');
            }
        } catch (err) {
            alert('Failed to toggle API key: ' + err.message);
        }
    };

    // ── Delete key ─────────────────────────────────────────────────────

    const handleDelete = async (keyId) => {
        if (!window.confirm(`Permanently revoke key ${keyId}?`)) return;
        try {
            const resp = await fetch(`${API_BASE_URL}/mcp/api-keys/${keyId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await resp.json();
            if (resp.ok && data.status === 'success') {
                await fetchKeys();
            } else {
                alert(data.detail || 'Failed to delete API key');
            }
        } catch (err) {
            alert('Failed to delete API key: ' + err.message);
        }
    };

    // ── Copy to clipboard ──────────────────────────────────────────────

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────

    if (loading) return <div className="mcp-keys"><p>Loading API keys…</p></div>;
    if (error)   return <div className="mcp-keys"><p className="error-message">{error}</p></div>;

    return (
        <div className="mcp-keys">
            <div className="mcp-keys-header">
                <h3>MCP API Keys</h3>
                <p className="mcp-keys-description">
                    API keys allow LLM agents to access the UV calculator through the MCP server.
                </p>
                <button className="btn-add" onClick={() => { setCreatedKey(null); setShowCreateModal(true); }}>
                    + Generate New Key
                </button>
            </div>

            {/* Keys table */}
            <div className="table-container">
                <table className="mcp-keys-table">
                    <thead>
                        <tr>
                            <th>Key ID</th>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Created</th>
                            <th>Created By</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.length === 0 ? (
                            <tr><td colSpan="7" className="no-data">No API keys yet</td></tr>
                        ) : (
                            keys.map((k) => (
                                <tr key={k.key_id} className={!k.active ? 'inactive-row' : ''}>
                                    <td className="mono">{k.key_id}</td>
                                    <td>{k.name}</td>
                                    <td className="mono">{k.key_preview}</td>
                                    <td>{k.created_at}</td>
                                    <td>{k.created_by}</td>
                                    <td>
                                        <span className={`status-badge ${k.active ? 'active' : 'inactive'}`}>
                                            {k.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className={`btn-toggle ${k.active ? 'btn-deactivate' : 'btn-activate'}`}
                                            onClick={() => handleToggle(k.key_id)}
                                            title={k.active ? 'Deactivate' : 'Activate'}
                                        >
                                            {k.active ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            className="btn-delete-key"
                                            onClick={() => handleDelete(k.key_id)}
                                            title="Permanently revoke"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setCreatedKey(null); }}>
                    <div className="modal mcp-key-modal" onClick={e => e.stopPropagation()}>
                        {!createdKey ? (
                            <>
                                <h3>Generate MCP API Key</h3>
                                <div className="form-group">
                                    <label>Key Name:</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        placeholder="e.g. Claude Desktop, Production Agent"
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <button className="btn-primary" onClick={handleCreate}>Generate</button>
                                    <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>🔑 API Key Created</h3>
                                <p className="key-warning">
                                    Copy this key now — it will <strong>not</strong> be shown again.
                                </p>
                                <div className="key-display">
                                    <code>{createdKey}</code>
                                    <button
                                        className="btn-copy"
                                        onClick={() => copyToClipboard(createdKey)}
                                    >
                                        {copied ? '✓ Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="modal-buttons">
                                    <button className="btn-primary" onClick={() => { setShowCreateModal(false); setCreatedKey(null); }}>
                                        Done
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default McpApiKeys;


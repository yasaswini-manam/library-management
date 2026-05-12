import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import { BookmarkPlus, CheckCircle } from 'lucide-react';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue Book Form
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ memberId: '', bookId: '' });
  const [members, setMembers] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/issues/active');
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      alert('Failed to load issues: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openIssueForm = async () => {
    setShowIssueForm(true);
    if (members.length === 0 || availableBooks.length === 0) {
      try {
        setFormLoading(true);
        const [membersData, booksData] = await Promise.all([
          fetchWithAuth('/api/members'),
          fetchWithAuth('/api/books/available')
        ]);
        setMembers(membersData);
        setAvailableBooks(booksData);
      } catch (error) {
        alert('Failed to load members/books: ' + error.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!newIssue.memberId || !newIssue.bookId) {
      alert('Please select both a member and a book.');
      return;
    }
    try {
      await fetchWithAuth('/api/issues/issue', {
        method: 'POST',
        body: JSON.stringify({
          memberId: parseInt(newIssue.memberId),
          bookId: parseInt(newIssue.bookId)
        })
      });
      setNewIssue({ memberId: '', bookId: '' });
      setShowIssueForm(false);
      // Refresh books list as availability changes
      setAvailableBooks([]);
      loadIssues();
    } catch (error) {
      alert('Failed to issue book: ' + error.message);
    }
  };

  const handleReturn = async (issueId) => {
    if (!window.confirm('Mark this book as returned?')) return;
    try {
      await fetchWithAuth(`/api/issues/return/${issueId}`, { method: 'PUT' });
      // Refresh available books for next issue
      setAvailableBooks([]);
      loadIssues();
    } catch (error) {
      alert('Failed to return book: ' + error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Issue &amp; Return</h1>
        <button onClick={() => { if (showIssueForm) setShowIssueForm(false); else openIssueForm(); }}>
          <BookmarkPlus size={20} />
          <span>{showIssueForm ? 'Cancel' : 'Issue Book'}</span>
        </button>
      </div>

      {showIssueForm && (
        <div className="glass-panel mb-6" style={{ borderLeft: '3px solid var(--primary, #6366f1)' }}>
          <h3 className="mb-4">Issue a Book to a Member</h3>
          {formLoading ? (
            <p>Loading members and available books...</p>
          ) : (
            <form onSubmit={handleIssue}>
              <div className="flex gap-4 items-end" style={{ flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label>Select Member *</label>
                  <select
                    value={newIssue.memberId}
                    onChange={(e) => setNewIssue({ ...newIssue, memberId: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--surface, #1e1e2e)', border: '1px solid var(--surface-border, #333)', borderRadius: '6px', color: 'inherit', fontSize: '0.95rem' }}
                  >
                    <option value="">-- Choose a member --</option>
                    {members.map(m => (
                      <option key={m.memberId} value={m.memberId}>
                        [{m.memberId}] {m.name} — {m.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 250px' }}>
                  <label>Select Available Book *</label>
                  <select
                    value={newIssue.bookId}
                    onChange={(e) => setNewIssue({ ...newIssue, bookId: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--surface, #1e1e2e)', border: '1px solid var(--surface-border, #333)', borderRadius: '6px', color: 'inherit', fontSize: '0.95rem' }}
                  >
                    <option value="">-- Choose a book --</option>
                    {availableBooks.map(b => (
                      <option key={b.bookId} value={b.bookId}>
                        [{b.bookId}] {b.title} — {b.author}
                      </option>
                    ))}
                  </select>
                  {availableBooks.length === 0 && !formLoading && (
                    <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '4px' }}>No books currently available.</p>
                  )}
                </div>
                <div>
                  <button type="submit" disabled={availableBooks.length === 0}>Issue Book</button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      <h3 className="mb-4">Active Issues</h3>
      {loading ? (
        <p>Loading active issues...</p>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '16px' }}>Issue #</th>
                <th style={{ padding: '16px' }}>Book</th>
                <th style={{ padding: '16px' }}>Member</th>
                <th style={{ padding: '16px' }}>Issue Date</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No active issues found.
                  </td>
                </tr>
              ) : (
                issues.map(issue => (
                  <tr key={issue.issueId} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '16px' }}>#{issue.issueId}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{issue.bookTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {issue.bookAuthor}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{issue.memberName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{issue.memberEmail}</div>
                    </td>
                    <td style={{ padding: '16px' }}>{new Date(issue.issueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button className="secondary" onClick={() => handleReturn(issue.issueId)}>
                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                        <span>Return</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Issues;

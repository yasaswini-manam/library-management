import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import { UserPlus, Mail, BookOpen, Phone } from 'lucide-react';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Register Member Form
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });

  // Member Issues Modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberIssues, setMemberIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/members');
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/api/members', {
        method: 'POST',
        body: JSON.stringify(newMember)
      });
      setNewMember({ name: '', email: '', phone: '' });
      setShowRegisterForm(false);
      loadMembers();
    } catch (error) {
      alert('Failed to register member: ' + error.message);
    }
  };

  const viewIssues = async (member) => {
    setSelectedMember(member);
    try {
      setIssuesLoading(true);
      const data = await fetchWithAuth(`/api/members/${member.memberId}/issues`);
      setMemberIssues(data);
    } catch (error) {
      alert('Failed to fetch issues: ' + error.message);
    } finally {
      setIssuesLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Library Members</h1>
        <button onClick={() => setShowRegisterForm(!showRegisterForm)}>
          <UserPlus size={20} />
          <span>{showRegisterForm ? 'Cancel' : 'Register Member'}</span>
        </button>
      </div>

      {showRegisterForm && (
        <div className="glass-panel mb-6">
          <h3 className="mb-4">Register New Member</h3>
          <form onSubmit={handleRegister} className="flex gap-4 items-end">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Name</label>
              <input 
                value={newMember.name} 
                onChange={(e) => setNewMember({...newMember, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Email</label>
              <input 
                type="email"
                placeholder="e.g. john@email.com"
                value={newMember.email} 
                onChange={(e) => setNewMember({...newMember, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Phone <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>(10 digits, optional)</span></label>
              <input 
                type="tel"
                placeholder="e.g. 9876543210"
                value={newMember.phone} 
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})} 
                maxLength={10}
              />
            </div>
            <button type="submit">Register</button>
          </form>
        </div>
      )}

      {selectedMember && (
        <div className="glass-panel mb-6" style={{ border: '1px solid var(--primary)' }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3>{selectedMember.name}'s Issued Books</h3>
              <p className="text-muted text-sm">{selectedMember.email}</p>
            </div>
            <button className="secondary" onClick={() => setSelectedMember(null)}>Close</button>
          </div>
          
          {issuesLoading ? (
            <p>Loading issues...</p>
          ) : memberIssues.length === 0 ? (
            <p className="text-muted">No books currently issued to this member.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '8px' }}>Book Title</th>
                  <th style={{ padding: '8px' }}>Issue Date</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {memberIssues.map(issue => (
                  <tr key={issue.issueId} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '8px' }}>{issue.bookTitle}</td>
                    <td style={{ padding: '8px' }}>{new Date(issue.issueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '8px' }}>
                      <span className={`badge ${issue.status === 'ACTIVE' ? 'warning' : 'success'}`}>
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {members.length === 0 ? (
            <p className="text-muted col-span-full">No members found.</p>
          ) : (
            members.map(member => (
              <div key={member.memberId} className="glass-card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.5rem', background: 'var(--secondary)' }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="m-0 text-lg">{member.name}</h3>
                    <div className="flex items-center gap-2 text-muted text-sm mt-1">
                      <Mail size={14} />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-muted text-sm mt-1">
                        <Phone size={14} />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-surface-border pt-3 mt-2 flex justify-between items-center">
                  <span className="text-sm text-muted">ID: {member.memberId}</span>
                  <button className="secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => viewIssues(member)}>
                    <BookOpen size={14} />
                    View Issues
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Members;

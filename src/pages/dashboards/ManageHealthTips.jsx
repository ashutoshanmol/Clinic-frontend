import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ManageHealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', content: '', author: 'Dr. System Admin', image: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/blog');
      setTips(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tips', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.author.trim()) errors.author = "Author is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/blog/${editId}`, formData);
        alert('Health tip updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/blog', formData);
        alert('Health tip published successfully');
      }
      setShowForm(false);
      resetForm();
      fetchTips();
    } catch (err) {
      alert('Error saving health tip');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (tip) => {
    setFormData({ title: tip.title, description: tip.description, content: tip.content, author: tip.author, image: tip.image || '' });
    setEditId(tip._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/blog/${id}`);
      fetchTips();
    } catch (err) {
      alert('Error deleting article');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', content: '', author: 'Dr. System Admin', image: '' });
    setFormErrors({});
    setIsEditing(false);
    setEditId(null);
  };

  const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', backgroundColor: 'var(--bg-color)', color: 'var(--text)' };

  return (
    <div className="container" style={{ padding: '2rem 0', minHeight: '80vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/admin" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>← Back to Dashboard</Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>Content Management System (CMS)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Publish and manage medical health tips.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); if(showForm) resetForm(); }}
          style={{ padding: '0.8rem 1.5rem', backgroundColor: showForm ? '#ef4444' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          {showForm ? 'Cancel Publishing' : '+ Publish New Article'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)', marginBottom: '3rem', border: '2px solid var(--primary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>{isEditing ? 'Edit Article' : 'Draft New Health Tip'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: 'var(--text)' }}>Article Title</label>
                <input name="title" value={formData.title} onChange={handleChange} style={{...inputStyle, marginBottom: '0.2rem'}} placeholder="E.g., 5 Benefits of Hydration" />
                {formErrors.title && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginBottom: '1rem' }}>{formErrors.title}</span>}
              </div>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: 'var(--text)' }}>Author Name</label>
                <input name="author" value={formData.author} onChange={handleChange} style={{...inputStyle, marginBottom: '0.2rem'}} />
                {formErrors.author && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginBottom: '1rem' }}>{formErrors.author}</span>}
              </div>
            </div>

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: 'var(--text)' }}>Short Description</label>
            <input name="description" value={formData.description} onChange={handleChange} style={{...inputStyle, marginBottom: '0.2rem'}} placeholder="A short summary for the blog card..." />
            {formErrors.description && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginBottom: '1rem' }}>{formErrors.description}</span>}

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: 'var(--text)' }}>Full Content (HTML/Markdown supported implicitly via text formatting)</label>
            <textarea name="content" value={formData.content} onChange={handleChange} style={{...inputStyle, height: '200px', resize: 'vertical', marginBottom: '0.2rem'}} placeholder="Write the full medical article here..."></textarea>
            {formErrors.content && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginBottom: '1rem' }}>{formErrors.content}</span>}

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: 'var(--text)' }}>Cover Image URL (Optional)</label>
            <input name="image" value={formData.image} onChange={handleChange} style={inputStyle} placeholder="https://example.com/image.jpg" />

            <button type="submit" disabled={submitLoading} style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
              {submitLoading ? 'Processing...' : isEditing ? 'Update Article' : 'Publish Article'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date Published</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Article Title</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Author</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tips.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No health tips published yet.
                  </td>
                </tr>
              ) : tips.map(tip => (
                <tr key={tip._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text)' }}>{new Date(tip.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', color: 'var(--text)', fontWeight: 600 }}>{tip.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text)' }}>👨‍⚕️ {tip.author}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleEdit(tip)} 
                      style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', fontSize: '0.85rem', backgroundColor: 'var(--bg-color)', color: 'var(--text)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(tip._id)} 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageHealthTips;

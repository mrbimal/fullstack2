import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addPost, updatePost } from '../store/postSlice';

const PLATFORMS = ['Instagram', 'LinkedIn', 'YouTube', 'Twitter', 'Facebook'];
const STATUSES = ['draft', 'scheduled', 'published'];
const PRIORITIES = ['low', 'medium', 'high'];

const empty = {
  id: '',
  title: '',
  description: '',
  platform: 'Instagram',
  date: '',
  time: '',
  status: 'draft',
  priority: 'medium',
  author: '',
};

const fieldStyle = {
  display: 'block',
  width: '100%',
  marginBottom: '8px',
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box',
  background: '#f8fafc',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
};
const labelStyle = { 
  fontSize: '13px', 
  color: '#475569', 
  marginBottom: '4px', 
  display: 'block',
  fontWeight: '500',
};
const buttonStyle = {
  width: '100%',
  padding: '10px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'all 0.2s',
};

export default function PostForm({ editingPost, onDone }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(empty);

  // when the parent sets an editing target, populate the form
  useEffect(() => {
    if (editingPost) {
      setForm({ ...empty, ...editingPost });
    } else {
      setForm(empty);
    }
  }, [editingPost]);

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    if (form.id) {
      const { id, ...rest } = form;
      dispatch(updatePost({ id, changes: rest }));
    } else {
      dispatch(addPost({ ...form }));
    }
    setForm(empty);
    if (onDone) onDone();
  };

  const cancel = () => {
    setForm(empty);
    if (onDone) onDone();
  };

  return (
    <form onSubmit={submit} data-testid="post-form" style={{ padding: '16px' }}>
      <label style={labelStyle} htmlFor="pf-title">Title</label>
      <input id="pf-title" data-testid="field-title" style={fieldStyle} value={form.title} onChange={change('title')} placeholder="Enter post title" />

      <label style={labelStyle} htmlFor="pf-desc">Description</label>
      <textarea id="pf-desc" data-testid="field-description" style={fieldStyle} value={form.description} onChange={change('description')} placeholder="Write your post content..." rows="3" />

      <label style={labelStyle} htmlFor="pf-platform">Platform</label>
      <select id="pf-platform" data-testid="field-platform" style={fieldStyle} value={form.platform} onChange={change('platform')}>
        {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={labelStyle} htmlFor="pf-date">Date</label>
          <input id="pf-date" data-testid="field-date" type="date" style={fieldStyle} value={form.date} onChange={change('date')} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-time">Time</label>
          <input id="pf-time" data-testid="field-time" type="time" style={fieldStyle} value={form.time} onChange={change('time')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={labelStyle} htmlFor="pf-status">Status</label>
          <select id="pf-status" data-testid="field-status" style={fieldStyle} value={form.status} onChange={change('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-priority">Priority</label>
          <select id="pf-priority" data-testid="field-priority" style={fieldStyle} value={form.priority} onChange={change('priority')}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <label style={labelStyle} htmlFor="pf-author">Author</label>
      <input id="pf-author" data-testid="field-author" style={fieldStyle} value={form.author} onChange={change('author')} placeholder="Your name" />

      <button type="submit" style={buttonStyle} data-testid="submit-button">
        {form.id ? '✏️ Update Post' : '➕ Create Post'}
      </button>
      {form.id && (
        <button type="button" onClick={cancel} style={{ ...buttonStyle, background: '#64748b', marginTop: '6px' }}>
          ✕ Cancel
        </button>
      )}
    </form>
  );
}

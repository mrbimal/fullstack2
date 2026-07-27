import { useMemo, useReducer, useState, useCallback } from 'react';
import { createSelector } from 'reselect';

const initialState = {
  drafts: [],
  loading: false,
  error: null,
};

function draftReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, drafts: action.payload };
    case 'LOAD_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_DRAFT':
      return { ...state, drafts: [action.payload, ...state.drafts] };
    case 'UPDATE_DRAFT':
      return {
        ...state,
        drafts: state.drafts.map((draft) =>
          draft.id === action.payload.id ? { ...draft, ...action.payload } : draft
        ),
      };
    case 'DELETE_DRAFT':
      return { ...state, drafts: state.drafts.filter((draft) => draft.id !== action.payload) };
    default:
      return state;
  }
}

const selectDrafts = (state) => state.drafts;
const selectSearchTerm = (_, searchTerm) => searchTerm;

const selectFilteredDrafts = createSelector(
  [selectDrafts, selectSearchTerm],
  (drafts, searchTerm) => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return drafts;
    return drafts.filter(
      (draft) =>
        draft.title.toLowerCase().includes(normalized) ||
        draft.content.toLowerCase().includes(normalized)
    );
  }
);

const selectDraftCounts = createSelector([selectDrafts], (drafts) => ({
  total: drafts.length,
  recent: drafts.filter((draft) => Date.now() - draft.updatedAt < 1000 * 60 * 60 * 24).length,
}));

const mockFetchDrafts = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', title: 'First draft', content: 'This is the first post draft.', updatedAt: Date.now() - 1000 * 60 * 90 },
        { id: '2', title: 'Travel notes', content: 'Write about the city and itinerary.', updatedAt: Date.now() - 1000 * 60 * 180 },
      ]);
    }, 400);
  });

export default function App() {
  const [state, dispatch] = useReducer(draftReducer, initialState);
  const [form, setForm] = useState({ id: '', title: '', content: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showMockApi, setShowMockApi] = useState(true);

  const filteredDrafts = useMemo(() => selectFilteredDrafts(state, searchTerm), [state, searchTerm]);
  const draftCounts = useMemo(() => selectDraftCounts(state), [state]);

  const loadDrafts = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const drafts = showMockApi ? await mockFetchDrafts() : [];
      dispatch({ type: 'LOAD_SUCCESS', payload: drafts });
    } catch (error) {
      dispatch({ type: 'LOAD_FAILURE', payload: error.message || 'Failed to load drafts' });
    }
  }, [showMockApi]);

  const saveDraft = useCallback(async () => {
    const now = Date.now();
    const draft = {
      id: form.id || `${now}`,
      title: form.title.trim() || 'Untitled draft',
      content: form.content.trim() || '',
      updatedAt: now,
    };

    if (form.id) {
      dispatch({ type: 'UPDATE_DRAFT', payload: draft });
    } else {
      dispatch({ type: 'ADD_DRAFT', payload: draft });
    }
    setForm({ id: '', title: '', content: '' });
  }, [form]);

  const editDraft = useCallback((draft) => {
    setForm({ id: draft.id, title: draft.title, content: draft.content });
  }, []);

  const deleteDraft = useCallback((draftId) => {
    dispatch({ type: 'DELETE_DRAFT', payload: draftId });
    if (form.id === draftId) {
      setForm({ id: '', title: '', content: '' });
    }
  }, [form.id]);

  return (
    <div className="app-shell">
      <header>
        <h1>Draft Management</h1>
        <div className="header-actions">
          <button onClick={loadDrafts} disabled={state.loading}>
            {state.loading ? 'Loading…' : 'Load Mock Drafts'}
          </button>
          <label>
            <input
              type="checkbox"
              checked={showMockApi}
              onChange={(event) => setShowMockApi(event.target.checked)}
            />
            Use mock API
          </label>
        </div>
      </header>

      <section className="panel">
        <div className="panel-grid">
          <div className="stats-card">
            <h2>Draft Summary</h2>
            <p>Total drafts: <strong>{draftCounts.total}</strong></p>
            <p>Recent drafts: <strong>{draftCounts.recent}</strong></p>
          </div>
          <div className="search-card">
            <label htmlFor="search">Search drafts</label>
            <input
              id="search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by title or content"
            />
          </div>
        </div>
      </section>

      <section className="panel form-panel">
        <h2>{form.id ? 'Edit Draft' : 'Create Draft'}</h2>
        <label>
          Title
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Draft title"
          />
        </label>
        <label>
          Content
          <textarea
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            placeholder="Draft content"
            rows={6}
          />
        </label>
        <div className="form-actions">
          <button onClick={saveDraft}>{form.id ? 'Update Draft' : 'Save Draft'}</button>
          <button
            type="button"
            className="secondary"
            onClick={() => setForm({ id: '', title: '', content: '' })}
          >
            Clear
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Saved Drafts</h2>
        {state.error && <p className="error">{state.error}</p>}
        {!filteredDrafts.length ? (
          <p className="empty-state">No drafts match the search or there are no drafts yet.</p>
        ) : (
          <ul className="draft-list">
            {filteredDrafts.map((draft) => (
              <li key={draft.id} className="draft-item">
                <div>
                  <h3>{draft.title}</h3>
                  <p>{draft.content || <em>No content yet.</em>}</p>
                  <small>
                    Updated {new Date(draft.updatedAt).toLocaleString()}
                  </small>
                </div>
                <div className="draft-actions">
                  <button onClick={() => editDraft(draft)}>Edit</button>
                  <button className="danger" onClick={() => deleteDraft(draft.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

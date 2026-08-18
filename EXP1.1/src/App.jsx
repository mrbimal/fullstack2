import { useMemo, useReducer, useState } from 'react';
import {
  draftReducer,
  initialDraftState,
  addDraft,
  updateDraft,
  deleteDraft,
  selectDrafts,
  selectFilteredDrafts,
} from './draftSlice.js';

const PLATFORM_OPTIONS = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    maxLength: 280,
    allowsMedia: true,
    hashtagRule: 'Use at most 2 hashtags',
    placeholder: 'Share a concise update...'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    maxLength: 2200,
    allowsMedia: true,
    hashtagRule: 'Hashtags are encouraged but should be relevant',
    placeholder: 'Craft a visual-first caption...'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    maxLength: 3000,
    allowsMedia: true,
    hashtagRule: 'Keep hashtags minimal and professional',
    placeholder: 'Write a polished professional update...'
  }
];

function App() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter']);
  const [mediaAttached, setMediaAttached] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draftForm, setDraftForm] = useState({ id: '', title: '', content: '' });

  const [draftState, dispatch] = useReducer(draftReducer, initialDraftState);

  const activePlatforms = useMemo(
    () => PLATFORM_OPTIONS.filter((platform) => selectedPlatforms.includes(platform.id)),
    [selectedPlatforms]
  );

  const validation = useMemo(() => {
    const issues = [];
    const warnings = [];
    const length = content.length;

    activePlatforms.forEach((platform) => {
      if (length > platform.maxLength) {
        issues.push(`${platform.name} exceeds the ${platform.maxLength}-character limit.`);
      } else if (length > platform.maxLength * 0.8) {
        warnings.push(`${platform.name} is approaching the length limit.`);
      }

      const hashtagCount = (content.match(/#/g) || []).length;
      if (platform.id === 'twitter' && hashtagCount > 2) {
        issues.push(`${platform.name} allows at most 2 hashtags.`);
      }

      if (!mediaAttached && platform.allowsMedia) {
        warnings.push(`${platform.name} may look stronger with media.`);
      }
    });

    return { issues, warnings };
  }, [activePlatforms, content, mediaAttached]);

  const filteredDrafts = useMemo(
    () => selectFilteredDrafts(draftState, searchTerm),
    [draftState, searchTerm]
  );

  const handleSaveDraft = () => {
    const now = Date.now();
    const draft = {
      id: draftForm.id || `${now}`,
      title: draftForm.title.trim() || 'Untitled draft',
      content: draftForm.content.trim(),
      updatedAt: now,
    };

    if (draftForm.id) {
      dispatch(updateDraft(draft));
    } else {
      dispatch(addDraft(draft));
    }

    setDraftForm({ id: '', title: '', content: '' });
  };

  const handleEditDraft = (draft) => {
    setDraftForm({ id: draft.id, title: draft.title, content: draft.content });
  };

  const handleDeleteDraft = (draftId) => {
    dispatch(deleteDraft(draftId));
    if (draftForm.id === draftId) {
      setDraftForm({ id: '', title: '', content: '' });
    }
  };

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms((current) =>
      current.includes(platformId)
        ? current.filter((id) => id !== platformId)
        : [...current, platformId]
    );
  };

  const handleMediaToggle = () => setMediaAttached((current) => !current);

  return (
    <div className="app-shell">
      <header className="hero-card">
        <p className="eyebrow">Module 4 • Dynamic Post Composer</p>
        <h1>Build once, publish everywhere</h1>
        <p className="hero-text">
          Compose content for multiple platforms while validating character limits, media usage, and formatting rules in real time.
        </p>
      </header>

      <main className="composer-card">
        <section className="panel">
          <div className="panel-header">
            <h2>Post content</h2>
            <span className={`counter ${content.length > 280 ? 'over-limit' : ''}`}>
              {content.length}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={activePlatforms[0]?.placeholder || 'Write something great...'}
            rows={8}
          />

          <div className="toggle-row">
            <label className="toggle-pill">
              <input type="checkbox" checked={mediaAttached} onChange={handleMediaToggle} />
              <span>Attach media</span>
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Select platforms</h2>
          </div>

          <div className="platform-grid">
            {PLATFORM_OPTIONS.map((platform) => (
              <label key={platform.id} className={`platform-card ${selectedPlatforms.includes(platform.id) ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platform.id)}
                  onChange={() => handlePlatformToggle(platform.id)}
                />
                <div>
                  <strong>{platform.name}</strong>
                  <p>{platform.hashtagRule}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="panel feedback-panel">
          <div className="panel-header">
            <h2>Live validation</h2>
          </div>

          <div className="feedback-list">
            {validation.issues.length === 0 && validation.warnings.length === 0 ? (
              <p className="success">Your content looks ready for the selected platforms.</p>
            ) : (
              <>
                {validation.issues.length > 0 && (
                  <div className="feedback-group">
                    <h3>Errors</h3>
                    <ul>
                      {validation.issues.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validation.warnings.length > 0 && (
                  <div className="feedback-group">
                    <h3>Warnings</h3>
                    <ul>
                      {validation.warnings.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="panel draft-panel">
          <div className="panel-header">
            <h2>Saved drafts</h2>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search drafts"
            />
          </div>

          <div className="draft-form">
            <label>
              Draft title
              <input
                value={draftForm.title}
                onChange={(event) => setDraftForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Draft title"
              />
            </label>
            <label>
              Draft content
              <textarea
                rows={4}
                value={draftForm.content}
                onChange={(event) => setDraftForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Draft content"
              />
            </label>
            <div className="draft-actions">
              <button type="button" onClick={handleSaveDraft}>
                {draftForm.id ? 'Update draft' : 'Save draft'}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setDraftForm({ id: '', title: '', content: '' })}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="draft-list">
            {filteredDrafts.length === 0 ? (
              <p className="empty-state">No drafts available.</p>
            ) : (
              filteredDrafts.map((draft) => (
                <article key={draft.id} className="draft-card">
                  <div>
                    <strong>{draft.title}</strong>
                    <p>{draft.content || <em>No draft content</em>}</p>
                    <small>Updated {new Date(draft.updatedAt).toLocaleString()}</small>
                  </div>
                  <div className="draft-card-actions">
                    <button type="button" onClick={() => handleEditDraft(draft)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDeleteDraft(draft.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

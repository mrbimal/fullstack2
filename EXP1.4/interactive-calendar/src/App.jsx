// Optimization toggles — each hook has its own switch so the user can flip
// them independently. All three start ON.
//   - memoOn: PostCard is wrapped in React.memo (skips re-render when props unchanged)
//   - useMemoOn: Calendar postsByDay map is memoized
//   - useCallbackOn: App handlers + Calendar event handlers use useCallback
//
// Calendar uses native HTML5 drag-and-drop:
//   - each post chip has draggable + onDragStart
//   - each day cell has onDragOver (preventDefault) + onDrop
//   - on drop, App dispatches reschedulePost with the new date
import { useState, useCallback, useRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost, reschedulePost } from './store/postSlice';
import PostForm from './components/PostForm';
import Calendar from './components/Calendar';
import PostCard from './components/PostCard';
import RenderCounter from './components/RenderCounter';
import PerformancePanel from './components/PerformancePanel';

// React.memo — skips re-render if props unchanged. Hoisted to module scope so
// the wrapper identity is stable across renders.
const PostCardMemo = memo(PostCard);

export default function App() {
  // Optimization toggles — each controls a real rendering behavior.
  const [memoOn, setMemoOn] = useState(true);
  const [useMemoOn, setUseMemoOn] = useState(true);
  const [useCallbackOn, setUseCallbackOn] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showDevTools, setShowDevTools] = useState(false);

  const posts = useSelector((state) => state.posts.posts);
  const dispatch = useDispatch();

  // Live render counts — kept in refs so updating them does not trigger a
  // re-render and risk feedback loops. We mirror the values into state only
  // when one of the toggles flips, which is exactly when we want to display
  // the new numbers anyway.
  const countsRef = useRef({ App: 0, Calendar: 0, PostCard: 0 });
  const [counts, setCounts] = useState({ App: 0, Calendar: 0, PostCard: 0 });
  countsRef.current.App += 1;

  const handleCounts = useCallback((name, value) => {
    countsRef.current[name] = value;
  }, []);

  // Stable handlers when useCallback is ON; recreated every render when OFF.
  const handleEditStable = useCallback((post) => setEditingPost(post), []);
  const handleDeleteStable = useCallback((id) => dispatch(deletePost(id)), [dispatch]);
  const handlePostDropStable = useCallback(
    (id, newDate) => dispatch(reschedulePost({ id, date: newDate })),
    [dispatch],
  );
  const handlePostClickStable = useCallback((post) => setEditingPost(post), []);

  const handleEditPlain = (post) => setEditingPost(post);
  const handleDeletePlain = (id) => dispatch(deletePost(id));
  const handlePostDropPlain = (id, newDate) =>
    dispatch(reschedulePost({ id, date: newDate }));
  const handlePostClickPlain = (post) => setEditingPost(post);

  const handleEdit = useCallbackOn ? handleEditStable : handleEditPlain;
  const handleDelete = useCallbackOn ? handleDeleteStable : handleDeletePlain;
  const handlePostDrop = useCallbackOn ? handlePostDropStable : handlePostDropPlain;
  const handlePostClick = useCallbackOn ? handlePostClickStable : handlePostClickPlain;

  // Mirror counts into state whenever any toggle flips so the panel updates.
  const prevToggles = useRef({ memoOn, useMemoOn, useCallbackOn });
  if (
    prevToggles.current.memoOn !== memoOn ||
    prevToggles.current.useMemoOn !== useMemoOn ||
    prevToggles.current.useCallbackOn !== useCallbackOn
  ) {
    prevToggles.current = { memoOn, useMemoOn, useCallbackOn };
    setCounts({ ...countsRef.current });
  }

  // Selected post for the bottom detail panel — first one if none highlighted
  const selectedPost = editingPost || posts[0];

  const PostCardToUse = memoOn ? PostCardMemo : PostCard;

  const flip = (setter) => {
    setCounts({ ...countsRef.current });
    setter((v) => !v);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
      {/* Modern Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600' }}>
            📅 Social Media Scheduler
          </h1>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Plan, schedule, and manage your social posts</p>
        </div>
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s'
          }}
        >
          {showDevTools ? '🛠️ Hide Dev' : '🛠️ Dev Tools'}
        </button>
      </div>

      {/* Dev Tools Bar */}
      {showDevTools && (
        <div style={{
          background: '#1f2937',
          color: '#fff',
          padding: '8px 16px',
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #374151',
        }}>
          <button
            type="button"
            data-testid="memo-toggle"
            onClick={() => flip(setMemoOn)}
            style={{
              padding: '5px 10px',
              background: memoOn ? '#059669' : '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            React.memo: {memoOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            data-testid="usememo-toggle"
            onClick={() => flip(setUseMemoOn)}
            style={{
              padding: '5px 10px',
              background: useMemoOn ? '#059669' : '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            useMemo: {useMemoOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            data-testid="usecallback-toggle"
            onClick={() => flip(setUseCallbackOn)}
            style={{
              padding: '5px 10px',
              background: useCallbackOn ? '#059669' : '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            useCallback: {useCallbackOn ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '350px 1fr 320px',
        gap: '16px',
        padding: '16px',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Left Sidebar - Form */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '12px 16px',
          }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>✨ New Post</h2>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <PostForm editingPost={editingPost} onDone={() => setEditingPost(null)} />
          </div>
        </div>

        {/* Center - Calendar */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Calendar
              posts={posts}
              onPostDrop={handlePostDrop}
              onPostClick={handlePostClick}
              onCountsChange={handleCounts}
              useMemoOn={useMemoOn}
              useCallbackOn={useCallbackOn}
            />
          </div>
        </div>

        {/* Right Sidebar - Details & Posts */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'hidden',
        }}>
          {/* Selected Post Card */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '12px',
            borderLeft: '4px solid #667eea',
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              📍 Selected Post
            </h3>
            {selectedPost ? (
              <PostCardToUse
                title={selectedPost.title}
                description={selectedPost.description}
                date={selectedPost.date}
                time={selectedPost.time}
                platform={selectedPost.platform}
                status={selectedPost.status}
                priority={selectedPost.priority}
                author={selectedPost.author}
              />
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '13px', padding: '8px', textAlign: 'center' }}>
                No post selected. Create or click a post to view details.
              </div>
            )}
          </div>

          {/* Posts List */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '12px',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              📋 All Posts ({posts.length})
            </h3>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {posts.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                  No posts yet. Create one to get started!
                </div>
              ) : (
                posts.map((p) => (
                  <div key={p.id} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }} onClick={() => handleEdit(p)}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                      {p.platform} • {p.date}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#dc2626',
                      }}
                      data-testid={`delete-${p.id}`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Panel */}
          {showDevTools && (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '12px',
            }}>
              <PerformancePanel
                memoOn={memoOn}
                useMemoOn={useMemoOn}
                useCallbackOn={useCallbackOn}
                counts={counts}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
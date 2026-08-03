import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPosts, selectAllPosts, addPost } from './postsSlice'
import { fetchPlatforms, selectAllPlatforms } from './platformsSlice'

export default function App() {
  const dispatch = useDispatch()
  const posts = useSelector(selectAllPosts)
  const postsState = useSelector((s) => s.posts)
  const platforms = useSelector(selectAllPlatforms)
  const platformsState = useSelector((s) => s.platforms)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])

  useEffect(() => {
    dispatch(fetchPosts())
    dispatch(fetchPlatforms())
  }, [dispatch])

  function handleAdd() {
    if (!title.trim()) return
    const now = Date.now()
    dispatch(
      addPost({ id: `${now}`, title: title.trim(), content: content.trim(), updatedAt: now, platforms: selectedPlatforms })
    )
    setTitle('')
    setContent('')
    setSelectedPlatforms([])
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, Arial' }}>
      <h1>EXP3 - Redux Toolkit Experiment</h1>

      <section style={{ marginBottom: 16 }}>
        <h2>Platforms</h2>
        {platformsState.loading ? (
          <p>Loading platforms…</p>
        ) : (
          <ul>
            {platforms.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2>Create Post</h2>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <br />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
        <br />
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'block', marginBottom: 6 }} className="muted">Select platforms</label>
          <ul className="platforms-list">
            {platforms.map((p) => (
              <li key={p.id}>
                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(p.id)}
                    onChange={() => {
                      setSelectedPlatforms((prev) =>
                        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                      )
                    }}
                  />
                  <span>{p.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 8 }} className="controls">
          <button onClick={handleAdd}>Add Post</button>
          <button type="button" className="secondary" onClick={() => { setTitle(''); setContent(''); setSelectedPlatforms([]) }}>Clear</button>
        </div>
      </section>

      <section>
        <h2>Posts</h2>
        {postsState.loading ? (
          <p>Loading posts…</p>
        ) : (
          <ul className="posts-list">
            {posts.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong>
                <div style={{ margin: '6px 0' }}>{p.content}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  {(p.platforms || []).map((pid) => {
                    const plat = platforms.find((x) => x.id === pid)
                    return (
                      <span key={pid} style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 999, fontSize: 12 }}>
                        {plat ? plat.name : pid}
                      </span>
                    )
                  })}
                </div>
                <small className="muted">{new Date(p.updatedAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

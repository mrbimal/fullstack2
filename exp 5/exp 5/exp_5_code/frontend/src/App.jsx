import { useState, useEffect } from 'react'
import PostComposer from './PostComposer'
import PostList from './PostList'
import GlobalError from './GlobalError'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
      setGlobalError(null);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setGlobalError("Could not connect to backend server. Make sure Spring Boot is running on port 8080.");
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (!response.ok) {
        throw new Error(`Create failed with status ${response.status}`);
      }
      fetchPosts();
    } catch (err) {
      console.error("Failed to create post", err);
      setGlobalError("Failed to create post.");
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post", err);
      setGlobalError("Failed to delete post.");
    }
  };

  const handleUpdatePost = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }
      fetchPosts();
    } catch (err) {
      console.error("Failed to update post", err);
      setGlobalError("Failed to update post.");
    }
  };

  return (
    <div className="app-container">
      <GlobalError message={globalError} onClose={() => setGlobalError(null)} />
      
      <header className="app-header">
        <h1>OmniPost Composer</h1>
        <p>Write once, publish anywhere. Respects platform word limits.</p>
      </header>
      
      <main className="app-main">
        <PostComposer 
          onPostCreate={handleCreatePost} 
          onError={setGlobalError} 
        />
        <PostList 
          posts={posts} 
          onDelete={handleDeletePost} 
          onUpdate={handleUpdatePost} 
        />
      </main>
    </div>
  )
}

export default App;


const postList = document.getElementById('post-list');
const newPostForm = document.getElementById('new-post-form');
const editPostForm = document.getElementById('edit-post-form');
const cancelEditBtn = document.getElementById('cancel-edit');

let editingPostId = null;

// Sample data for localStorage
function initializeData() {
  const existingPosts = localStorage.getItem('blogPosts');
  if (!existingPosts) {
    const initialData = {
      posts: [
        {
          id: "1",
          title: "First Blog Post",
          content: "This is the content of the first blog post.",
          author: "Author One",
          likes: 4
        }
      ],
      nextId: 2
    };
    localStorage.setItem('blogPosts', JSON.stringify(initialData.posts));
    localStorage.setItem('nextPostId', initialData.nextId.toString());
  }
}

// Get all posts
function getAllPosts() {
  const posts = localStorage.getItem('blogPosts');
  return posts ? JSON.parse(posts) : [];
}

// Get-post by ID
function getPostById(id) {
  const posts = getAllPosts();
  return posts.find(post => post.id === id);
}

// Save posts to localStorage
function savePosts(posts) {
  localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Get next available ID
function getNextId() {
  const nextId = localStorage.getItem('nextPostId');
  return nextId ? parseInt(nextId) : 1;
}

// Update next ID
function updateNextId(id) {
  localStorage.setItem('nextPostId', id.toString());
}

// Simulate fetch API for consistency with original code
function mockFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const posts = getAllPosts();

        if (options.method === 'POST') {
          // Create new post
          const newPost = JSON.parse(options.body);
          const nextId = getNextId();
          newPost.id = nextId.toString();
          posts.push(newPost);
          savePosts(posts);
          updateNextId(nextId + 1);

          resolve({
            ok: true,
            json: () => Promise.resolve(newPost)
          });
        }
        else if (options.method === 'PATCH') {
          // Update existing post
          const updatedData = JSON.parse(options.body);
          const postId = url.split('/').pop();
          const postIndex = posts.findIndex(p => p.id === postId);

          if (postIndex !== -1) {
            posts[postIndex] = { ...posts[postIndex], ...updatedData };
            savePosts(posts);
            resolve({
              ok: true,
              json: () => Promise.resolve(posts[postIndex])
            });
          } else {
            reject(new Error('Post not found'));
          }
        }
        else if (options.method === 'DELETE') {
          // Delete post
          const postId = url.split('/').pop();
          const filteredPosts = posts.filter(p => p.id !== postId);
          savePosts(filteredPosts);

          resolve({
            ok: true,
            json: () => Promise.resolve({})
          });
        }
        else if (url.includes('/posts/')) {
          // Get single post
          const postId = url.split('/').pop();
          const post = getPostById(postId);

          if (post) {
            resolve({
              ok: true,
              json: () => Promise.resolve(post)
            });
          } else {
            reject(new Error('Post not found'));
          }
        }
        else {
          // Get all posts
          resolve({
            ok: true,
            json: () => Promise.resolve(posts)
          });
        }
      } catch (error) {
        reject(error);
      }
    }, 100);
  });
}


const BASE_URL = '/posts'; // Th

const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/posts') || url === BASE_URL) {
    return mockFetch(url, options);
  }
  return originalFetch.apply(this, arguments);
};

function loadPosts() {
  postList.innerHTML = '<h2>All Posts</h2>';

  fetch(BASE_URL)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load posts');
      return res.json();
    })
    .then(posts => posts.forEach(renderPost))
    .catch(error => console.error("Error loading posts:", error));
}

function renderPost(post) {
  const card = document.createElement('div');
  card.className = 'post-card';

  card.innerHTML = `
    <h3>${escapeHtml(post.title)}</h3>
    <p>${escapeHtml(post.content)}</p>
    <p class="author">— ${escapeHtml(post.author)}</p>
    <p><strong>Likes:</strong> ${post.likes ?? 0}</p>
    <div class="button-group">
      <button class="btn edit-btn" data-id="${post.id}">
        <i class="fas fa-pen"></i> Edit
      </button>
      <button class="btn delete-btn" data-id="${post.id}">
        <i class="fas fa-trash"></i> Delete
      </button>
      <button class="btn like-btn" data-id="${post.id}">
        <i class="fas fa-heart"></i> Like
      </button>
    </div>
  `;

  postList.appendChild(card);
}

// Add HTML escaping for security
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

newPostForm.addEventListener('submit', e => {
  e.preventDefault();

  const newPost = {
    title: newPostForm.title.value,
    content: newPostForm.content.value,
    author: newPostForm.author.value,
    likes: 0
  };

  fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost)
  })
    .then(res => res.json())
    .then(() => {
      loadPosts();
      newPostForm.reset();
    })
    .catch(error => console.error("Error creating post:", error));
});

// Post Actions (Edit, Delete, Like)
postList.addEventListener('click', e => {
  const button = e.target.closest('button');
  if (!button) return;

  const postId = button.dataset.id;

  if (button.classList.contains('edit-btn')) {
    startEditing(postId);
  }

  if (button.classList.contains('delete-btn')) {
    deletePost(postId);
  }

  if (button.classList.contains('like-btn')) {
    likePost(postId);
  }
});

// Start editing a post
function startEditing(id) {
  editingPostId = id;
  fetch(`${BASE_URL}/${id}`)
    .then(res => res.json())
    .then(post => {
      editPostForm.classList.remove('hidden');

      editPostForm['edit-title'].value = post.title;
      editPostForm['edit-content'].value = post.content;
    })
    .catch(error => console.error("Error loading post for edit:", error));
}

// Cancel edit
cancelEditBtn.addEventListener('click', () => {
  editingPostId = null;
  editPostForm.reset();
  editPostForm.classList.add('hidden');
});

// Submit edit
editPostForm.addEventListener('submit', e => {
  e.preventDefault();

  const updatedPost = {
    title: editPostForm['edit-title'].value,
    content: editPostForm['edit-content'].value
  };

  fetch(`${BASE_URL}/${editingPostId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedPost)
  })
    .then(res => res.json())
    .then(() => {
      editingPostId = null;
      editPostForm.reset();
      editPostForm.classList.add('hidden');
      loadPosts();
    })
    .catch(error => console.error("Error updating post:", error));
});

// Delete a post
function deletePost(id) {
  if (confirm('Are you sure you want to delete this post?')) {
    fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
      .then(() => loadPosts())
      .catch(error => console.error("Error deleting post:", error));
  }
}

// Like a post
function likePost(id) {
  fetch(`${BASE_URL}/${id}`)
    .then(res => res.json())
    .then(post => {
      const updatedLikes = { likes: (post.likes || 0) + 1 };
      return fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLikes)
      });
    })
    .then(() => loadPosts())
    .catch(error => console.error("Error liking post:", error));
}

// Initialize data and load posts
initializeData();
loadPosts();
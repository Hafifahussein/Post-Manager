const BASE_URL = 'http://localhost:3000/posts';

// DOM Elements
const postList = document.getElementById('post-list');
const newPostForm = document.getElementById('new-post-form');
const editPostForm = document.getElementById('edit-post-form');
const cancelEditBtn = document.getElementById('cancel-edit');

let editingPostId = null;

/**
 * Load and render all blog posts
 */
function loadPosts() {
  postList.innerHTML = '<h2>All Posts</h2>';

  fetch(BASE_URL)
    .then(res => res.json())
    .then(posts => posts.forEach(renderPost))
    .catch(err => console.error('Error loading posts:', err));
}

/**
 * Render a single post
 */
function renderPost(post) {
  const postCard = document.createElement('div');
  postCard.className = 'post-card';

  postCard.innerHTML = `
    <h3>${post.title}</h3>
    <p>${post.content}</p>
    <p class="author">— ${post.author}</p>
    <p><strong>Likes:</strong> ${post.likes ?? 0}</p>
    <div class="button-group">
      <button class="btn edit-btn" data-id="${post.id}" title="Edit">
        <i class="fas fa-pen"></i> Edit
      </button>
      <button class="btn cancel delete-btn" data-id="${post.id}" title="Delete">
        <i class="fas fa-trash"></i> Delete
      </button>
      <button class="btn like-btn" data-id="${post.id}" title="Like">
        <i class="fas fa-heart"></i> Like
      </button>
    </div>
  `;

  postList.appendChild(postCard);
}

/**
 * Handle new post submission
 */
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
    .catch(err => console.error('Error creating post:', err));
});

/**
 * Handle edit, delete, and like actions
 */
postList.addEventListener('click', e => {
  const button = e.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;

  // Edit
  if (button.classList.contains('edit-btn')) {
    editingPostId = id;
    fetch(`${BASE_URL}/${id}`)
      .then(res => res.json())
      .then(post => {
        editPostForm.classList.remove('hidden');
        newPostForm.classList.add('hidden');

        editPostForm['edit-title'].value = post.title;
        editPostForm['edit-content'].value = post.content;
      })
      .catch(err => console.error('Error loading post for edit:', err));
  }

  // Delete
  if (button.classList.contains('delete-btn')) {
    fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    })
      .then(() => loadPosts())
      .catch(err => console.error('Error deleting post:', err));
  }

  // Like
  if (button.classList.contains('like-btn')) {
    fetch(`${BASE_URL}/${id}`)
      .then(res => res.json())
      .then(post => {
        const updatedLikes = { likes: (post.likes ?? 0) + 1 };
        return fetch(`${BASE_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLikes)
        });
      })
      .then(() => loadPosts())
      .catch(err => console.error('Error liking post:', err));
  }
});

/**
 * Cancel editing
 */
cancelEditBtn.addEventListener('click', () => {
  editingPostId = null;
  editPostForm.classList.add('hidden');
  newPostForm.classList.remove('hidden');
  editPostForm.reset();
});

/**
 * Submit edit form
 */
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
      loadPosts();
      editPostForm.classList.add('hidden');
      newPostForm.classList.remove('hidden');
      editPostForm.reset();
      editingPostId = null;
    })
    .catch(err => console.error('Error updating post:', err));
});


loadPosts();

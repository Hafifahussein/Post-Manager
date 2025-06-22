const BASE_URL = 'http://localhost:3000/posts';
const postList = document.getElementById('post-list');
const newPostForm = document.getElementById('new-post-form');
const editPostForm = document.getElementById('edit-post-form');
const cancelEditBtn = document.getElementById('cancel-edit');

let editingPostId = null;

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
    <h3>${post.title}</h3>
    <p>${post.content}</p>
    <p class="author">— ${post.author}</p>
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
    });
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
      newPostForm.classList.add('hidden');

      editPostForm['edit-title'].value = post.title;
      editPostForm['edit-content'].value = post.content;
    });
}

// Cancel edit
cancelEditBtn.addEventListener('click', () => {
  editingPostId = null;
  editPostForm.reset();
  editPostForm.classList.add('hidden');
  newPostForm.classList.remove('hidden');
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
      newPostForm.classList.remove('hidden');
      loadPosts();
    });
});

// Delete a post
function deletePost(id) {
  fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
    .then(() => loadPosts());
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
    .then(() => loadPosts());
}


loadPosts();
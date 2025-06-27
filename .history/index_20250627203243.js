const postList = document.getElementById('post-list');
const newPostForm = document.getElementById('new-post-form');
const editPostForm = document.getElementById('edit-post-form');
const cancelEditBtn = document.getElementById('cancel-edit');

let editingPostId = null;

// Initialize posts in localStorage if not exists
if (!localStorage.getItem('posts')) {
  localStorage.setItem('posts', JSON.stringify([
    {
      id: "1",
      title: "First Blog Post",
      content: "This is the content of the first blog post.",
      author: "Author One",
      likes: 4
    }
  ]));
}

function loadPosts() {
  postList.innerHTML = '<h2>All Posts</h2>';
  const posts = JSON.parse(localStorage.getItem('posts'));
  posts.forEach(renderPost);
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

  const posts = JSON.parse(localStorage.getItem('posts'));
  const newPost = {
    id: Date.now().toString(),
    title: newPostForm.title.value,
    content: newPostForm.content.value,
    author: newPostForm.author.value,
    likes: 0
  };

  posts.push(newPost);
  localStorage.setItem('posts', JSON.stringify(posts));

  loadPosts();
  newPostForm.reset();
});

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

function startEditing(id) {
  editingPostId = id;
  const posts = JSON.parse(localStorage.getItem('posts'));
  const post = posts.find(p => p.id === id);

  editPostForm.classList.remove('hidden');
  newPostForm.classList.add('hidden');

  editPostForm['edit-title'].value = post.title;
  editPostForm['edit-content'].value = post.content;
}

cancelEditBtn.addEventListener('click', () => {
  editingPostId = null;
  editPostForm.reset();
  editPostForm.classList.add('hidden');
  newPostForm.classList.remove('hidden');
});

editPostForm.addEventListener('submit', e => {
  e.preventDefault();

  const posts = JSON.parse(localStorage.getItem('posts'));
  const postIndex = posts.findIndex(p => p.id === editingPostId);

  posts[postIndex] = {
    ...posts[postIndex],
    title: editPostForm['edit-title'].value,
    content: editPostForm['edit-content'].value
  };

  localStorage.setItem('posts', JSON.stringify(posts));

  editingPostId = null;
  editPostForm.reset();
  editPostForm.classList.add('hidden');
  newPostForm.classList.remove('hidden');
  loadPosts();
});

function deletePost(id) {
  const posts = JSON.parse(localStorage.getItem('posts'));
  const filteredPosts = posts.filter(post => post.id !== id);
  localStorage.setItem('posts', JSON.stringify(filteredPosts));
  loadPosts();
}

function likePost(id) {
  const posts = JSON.parse(localStorage.getItem('posts'));
  const postIndex = posts.findIndex(p => p.id === id);
  posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
  localStorage.setItem('posts', JSON.stringify(posts));
  loadPosts();
}

loadPosts();
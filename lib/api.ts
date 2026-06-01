const BASE_URL = '/api';

// ── USERS ──────────────────────────────────────────
export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
}

export async function getUserById(id: string) {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  return res.json();
}

export async function createUser(data: object) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateUser(id: string, data: object) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function followUser(targetId: string, userId: string) {
  const res = await fetch(`${BASE_URL}/users/${targetId}/follow`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function unfollowUser(targetId: string, userId: string) {
  const res = await fetch(`${BASE_URL}/users/${targetId}/unfollow`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function getUsersBySkill(skillId: string) {
  const res = await fetch(`${BASE_URL}/users/skill/${skillId}`);
  return res.json();
}

// ── SKILLS ─────────────────────────────────────────
export async function getAllSkills() {
  const res = await fetch(`${BASE_URL}/skills`);
  return res.json();
}

export async function getSkillsByUser(userId: string) {
  const res = await fetch(`${BASE_URL}/skills/user/${userId}`);
  return res.json();
}

export async function createSkill(data: object) {
  const res = await fetch(`${BASE_URL}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── POSTS ──────────────────────────────────────────
export async function getAllPosts() {
  const res = await fetch(`${BASE_URL}/posts`);
  return res.json();
}

export async function getPostsByUser(userId: string) {
  const res = await fetch(`${BASE_URL}/posts/user/${userId}`);
  return res.json();
}

export async function createPost(data: object) {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function likePost(id: string) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, { method: 'PUT' });
  return res.json();
}

export async function deletePost(id: string) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, { method: 'DELETE' });
  return res.json();
}

// ── EXCHANGES ──────────────────────────────────────
export async function getExchangesByUser(userId: string) {
  const res = await fetch(`${BASE_URL}/exchanges/user/${userId}`);
  return res.json();
}

export async function createExchange(data: object) {
  const res = await fetch(`${BASE_URL}/exchanges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateExchangeStatus(id: string, status: string) {
  const res = await fetch(`${BASE_URL}/exchanges/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ── REVIEWS ────────────────────────────────────────
export async function getReviewsByUser(userId: string) {
  const res = await fetch(`${BASE_URL}/reviews/user/${userId}`);
  return res.json();
}

export async function createReview(data: object) {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getCompletedExchangesWith(userId: string, otherUserId: string) {
  const res = await fetch(`${BASE_URL}/exchanges/user/${userId}`);
  const exchanges = await res.json();
  if (!Array.isArray(exchanges)) return [];
  return exchanges.filter((e: any) =>
    e.status === 'completed' &&
    (e.requesterId === otherUserId || e.receiverId === otherUserId)
  );
}
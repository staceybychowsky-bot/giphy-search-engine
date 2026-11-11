'use strict';

const GIPHY_API_KEY = '4mGdYuDxMnFxMts2tdhcLjlpEpDzVN9r';
const TRENDING_URL = 'https://api.giphy.com/v1/gifs/trending';
const TRENDING_LIMIT = 12;
const CONTENT_RATING = 'g';

const resultsContainer = document.querySelector('#results');

function showMessage(message, kind = 'info') {
  const state = document.createElement('div');
  state.className = `empty-state ${kind}-state`;
  state.setAttribute('role', kind === 'error' ? 'alert' : 'status');

  const text = document.createElement('p');
  text.textContent = message;
  state.append(text);
  resultsContainer.replaceChildren(state);
}

function createGifCard(gif) {
  const card = document.createElement('a');
  card.className = 'gif-card';
  card.href = gif.url || `https://giphy.com/gifs/${encodeURIComponent(gif.id)}`;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Open GIF: ${gif.title || 'Untitled GIF'}`);

  const image = document.createElement('img');
  image.src = gif.images?.fixed_width?.webp || gif.images?.fixed_width?.url || gif.images?.original?.url || '';
  image.alt = gif.title || 'Trending GIF';
  image.loading = 'lazy';
  image.decoding = 'async';
  card.append(image);

  if (gif.title?.trim()) {
    const title = document.createElement('span');
    title.className = 'gif-title';
    title.textContent = gif.title;
    card.append(title);
  }

  return card;
}

async function fetchTrendingGifs() {
  if (!resultsContainer) return;
  showMessage('Loading trending GIFs…');
  resultsContainer.setAttribute('aria-busy', 'true');

  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    limit: String(TRENDING_LIMIT),
    rating: CONTENT_RATING,
  });

  try {
    const response = await fetch(`${TRENDING_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`GIPHY returned status ${response.status}`);
    }

    const payload = await response.json();
    const gifs = Array.isArray(payload.data) ? payload.data : [];
    if (gifs.length === 0) {
      showMessage('No trending GIFs are available right now. Please try again later.');
      return;
    }

    const cards = gifs.map(createGifCard);
    resultsContainer.replaceChildren(...cards);
  } catch (error) {
    console.error('Unable to load trending GIFs:', error);
    showMessage('We couldn’t load trending GIFs. Please check your connection and try again.', 'error');
  } finally {
    resultsContainer.setAttribute('aria-busy', 'false');
  }
}

fetchTrendingGifs();


'use strict';

const GIPHY_API_KEY = '4mGdYuDxMnFxMts2tdhcLjlpEpDzVN9r';
const TRENDING_URL = 'https://api.giphy.com/v1/gifs/trending';
const SEARCH_URL = 'https://api.giphy.com/v1/gifs/search';
const GIF_LIMIT = 12;
const CONTENT_RATING = 'g';

const resultsContainer = document.querySelector('#results');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const detailsDialog = document.querySelector('#gif-modal');
const modalPreview = document.querySelector('#modal-preview');
const modalTitle = document.querySelector('#modal-gif-title');
const openOnGiphy = document.querySelector('#open-on-giphy');
const copyGifUrlButton = document.querySelector('#copy-gif-url');
const copyStatus = document.querySelector('#copy-status');
const closeModalButton = document.querySelector('#modal-close');
let selectedGifUrl = '';

function showMessage(message, kind = 'info') {
  if (!resultsContainer) return;
  const state = document.createElement('div');
  state.className = `empty-state ${kind}-state`;
  state.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  if (kind === 'loading') {
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    state.append(spinner);
  }
  const text = document.createElement('p');
  text.textContent = message;
  state.append(text);
  resultsContainer.replaceChildren(state);
}

function createGifCard(gif) {
  const card = document.createElement('button');
  card.className = 'gif-card';
  card.type = 'button';
  card.setAttribute('aria-label', `View GIF details: ${gif.title || 'Untitled GIF'}`);

  const image = document.createElement('img');
  image.src = gif.images?.fixed_width?.webp || gif.images?.fixed_width?.url || gif.images?.original?.url || '';
  image.alt = gif.title || 'GIF result';
  image.loading = 'lazy';
  image.decoding = 'async';
  card.append(image);

  if (gif.title?.trim()) {
    const title = document.createElement('span');
    title.className = 'gif-title';
    title.textContent = gif.title;
    card.append(title);
  }
  card.addEventListener('click', () => openGifDetails(gif));
  return card;
}

function renderGifs(gifs, emptyMessage) {
  if (!resultsContainer) return;
  if (gifs.length === 0) {
    showMessage(emptyMessage);
    return;
  }
  resultsContainer.replaceChildren(...gifs.map(createGifCard));
}

async function requestGifs(url, params, loadingMessage, emptyMessage, errorMessage) {
  if (!resultsContainer) return;
  showMessage(loadingMessage, 'loading');
  resultsContainer.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(`${url}?${params}`);
    if (!response.ok) throw new Error(`GIPHY returned status ${response.status}`);
    const payload = await response.json();
    renderGifs(Array.isArray(payload.data) ? payload.data : [], emptyMessage);
  } catch (error) {
    console.error('Unable to load GIFs:', error);
    showMessage(errorMessage, 'error');
  } finally {
    resultsContainer.setAttribute('aria-busy', 'false');
  }
}

function fetchTrendingGifs() {
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    limit: String(GIF_LIMIT),
    rating: CONTENT_RATING,
  });
  return requestGifs(
    TRENDING_URL,
    params,
    'Loading trending GIFs…',
    'No trending GIFs are available right now. Please try again later.',
    'We couldn’t load trending GIFs. Please check your connection and try again.'
  );
}

function fetchSearchGifs(keyword) {
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    q: keyword,
    limit: String(GIF_LIMIT),
    rating: CONTENT_RATING,
  });
  return requestGifs(
    SEARCH_URL,
    params,
    `Searching for “${keyword}”…`,
    `No GIFs found for “${keyword}”. Try another search.`,
    'We couldn’t complete your search. Please check your connection and try again.'
  );
}

function openGifDetails(gif) {
  if (!detailsDialog || !modalPreview || !openOnGiphy || !modalTitle || !copyStatus) return;
  selectedGifUrl = gif.url || `https://giphy.com/gifs/${encodeURIComponent(gif.id)}`;
  modalPreview.src = gif.images?.original?.url || gif.images?.downsized_medium?.url || gif.images?.fixed_width?.url || '';
  modalPreview.alt = gif.title || 'Selected GIF';
  modalTitle.textContent = gif.title?.trim() || '';
  modalTitle.hidden = !gif.title?.trim();
  openOnGiphy.href = selectedGifUrl;
  copyStatus.textContent = '';
  detailsDialog.showModal();
}

if (searchForm && searchInput) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = searchInput.value.trim();
    if (!keyword) {
      searchInput.focus();
      showMessage('Enter a keyword to search for GIFs.');
      return;
    }
    fetchSearchGifs(keyword);
  });
}

closeModalButton?.addEventListener('click', () => detailsDialog?.close());
detailsDialog?.addEventListener('click', (event) => {
  if (event.target === detailsDialog) detailsDialog.close();
});
detailsDialog?.addEventListener('close', () => {
  modalPreview?.removeAttribute('src');
  if (copyStatus) copyStatus.textContent = '';
});
copyGifUrlButton?.addEventListener('click', async () => {
  if (!selectedGifUrl || !copyStatus) return;
  try {
    await navigator.clipboard.writeText(selectedGifUrl);
    copyStatus.textContent = 'GIF URL copied to clipboard.';
  } catch (error) {
    console.error('Unable to copy GIF URL:', error);
    copyStatus.textContent = 'Could not copy the URL. Check clipboard permissions and try again.';
  }
});

fetchTrendingGifs();


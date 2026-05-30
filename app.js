import { groups } from './students-data.js';

const defaultNotice =
  "Merci de revoir vos notes. Ceux qui n'ont pas encore envoyé leur travail peuvent le soumettre dans les prochaines 24h via le formulaire ci-dessous.";
const noticeFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSfA2hJ6PCM2q-kBq_a5qigTYLalVdjpI_b2CfgE7-Q8dZuPCw/viewform?usp=header';

const app = document.querySelector('#app');
const allStudents = groups.flatMap((group) => group.students.map((student) => ({ ...student })));
const zeroCount = allStudents.filter((student) => Number(student.grade) === 0).length;
const totalCount = allStudents.length;
const groupTotals = groups.map((group) => ({
  group: group.group,
  total: group.students.length,
  zeros: group.students.filter((student) => Number(student.grade) === 0).length,
}));

const state = {
  query: '',
  group: 'All',
};

app.innerHTML = `
  <div class="portal">
    <section class="hero">
      <div class="hero-copy">
        <p class="kicker">Portail des notes</p>
        <h1>Affichage des notes</h1>
      </div>
      <div class="hero-meta" aria-label="Résumé des notes">
        <span class="meta-pill">${totalCount} étudiants</span>
        <span class="meta-pill">2 groupes</span>
      </div>
    </section>

    <section class="notice" aria-labelledby="notice-title">
      <div>
        <h2 id="notice-title">Annonce</h2>
        <p>Message officiel pour les étudiants avant la consultation des notes.</p>
      </div>

      <div class="notice-message" id="notice-display"></div>
    </section>

    <section class="panel" aria-labelledby="search-title">
      <div class="panel-top">
        <div class="search-row">
          <label id="search-title" for="student-search">Rechercher un étudiant</label>
          <input id="student-search" type="search" placeholder="Tapez un nom..." autocomplete="off" />
        </div>

        <div class="filters" id="group-filters" aria-label="Filtre de groupe"></div>
      </div>

      <div class="summary-grid" aria-label="Vue d'ensemble des groupes">
        ${groupTotals
          .map(
            (item) => `
              <article class="summary-card">
                <span>${item.group}</span>
                <strong>${item.total}</strong>
                <small>Notes disponibles</small>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>

    <section class="results-shell" aria-labelledby="results-title">
      <div class="results-header">
        <div>
          <h2 id="results-title">Étudiants</h2>
          <p id="results-meta"></p>
        </div>
      </div>
      <ul class="results" id="results-list"></ul>
    </section>
  </div>
`;

const noticeDisplay = document.querySelector('#notice-display');
const searchInput = document.querySelector('#student-search');
const resultsList = document.querySelector('#results-list');
const resultsMeta = document.querySelector('#results-meta');
const groupFilters = document.querySelector('#group-filters');

searchInput.addEventListener('input', () => {
  state.query = searchInput.value.trim().toLowerCase();
  renderStudents();
});

renderFilters();
renderNotice();
renderStudents();

function renderFilters() {
  const buttons = [
    { label: 'Tous', count: totalCount },
    ...groupTotals.map((item) => ({ label: item.group, count: item.total })),
  ];

  groupFilters.innerHTML = buttons
    .map(
      (button) => `
        <button
          class="filter-btn"
          type="button"
          data-group="${button.label}"
          aria-pressed="${button.label === state.group ? 'true' : 'false'}"
        >
          ${button.label} <span>(${button.count})</span>
        </button>
      `,
    )
    .join('');

  groupFilters.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.group = button.dataset.group || 'Tous';
      renderFilters();
      renderStudents();
    });
  });
}

function renderNotice() {
  noticeDisplay.innerHTML = `
    <p>${escapeHtml(defaultNotice)}</p>
    <p>
      <a href="${noticeFormUrl}" target="_blank" rel="noreferrer noopener">Ouvrir le formulaire</a>
    </p>
  `;
}

function renderStudents() {
  const filtered = allStudents.filter((student) => {
    const matchesGroup = state.group === 'Tous' || student.group === state.group;
    const matchesQuery = !state.query || student.name.toLowerCase().includes(state.query);
    return matchesGroup && matchesQuery;
  });

  resultsMeta.textContent = `${filtered.length} résultat${filtered.length === 1 ? '' : 's'} affiché${filtered.length === 1 ? '' : 's'}`;

  if (!filtered.length) {
    resultsList.innerHTML = `
      <li class="empty-state">
        Aucun étudiant ne correspond à cette recherche. Essayez une autre orthographe ou changez de groupe.
      </li>
    `;
    return;
  }

  resultsList.innerHTML = filtered
    .map(
      (student) => `
        <li class="student-card ${Number(student.grade) === 0 ? 'zero' : ''}">
          <div class="student-info">
            <h3 class="student-name">${escapeHtml(student.name)}</h3>
            <div class="student-meta">
              <span class="group-chip">${student.group}</span>
            </div>
          </div>
          <span class="grade-badge" aria-label="Grade ${student.grade}">${student.grade}</span>
        </li>
      `,
    )
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createToast() {
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  return element;
}

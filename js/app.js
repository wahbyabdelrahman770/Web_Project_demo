(function () {
  var body = document.body, KEY = 'rf-role';
  var needs = body.dataset.needs, def = (localStorage.getItem(KEY) ? localStorage.getItem(KEY) : "guest");
  var role = localStorage.getItem(KEY) || def;
  if (needs === 'admin' && role !== 'admin') role = 'admin';
  if (needs === 'user' && role === 'guest') role = 'user';
  function setRole(r) { role = r; localStorage.setItem(KEY, r); body.dataset.role = r; var s = document.getElementById('role-select'); if (s) s.value = r; }
  setRole(role);
  var sel = document.getElementById('role-select');
  if (sel) sel.addEventListener('change', function () { setRole(sel.value); });
  document.querySelectorAll('[data-logout]').forEach(function (a) { a.addEventListener('click', function () { setRole('guest'); }); });

  /* login / signup: choose role then go to the matching page */
  var auth = document.querySelector('form[data-auth]');
  if (auth) auth.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = auth.querySelector('select[name=account]').value;
    setRole(t); location.href = t === 'admin' ? 'admin.html' : 'browse.html';
  });

  /* browse: filter sample cards */
  var sf = document.getElementById('search-form');
  if (sf) {
    var cards = [].slice.call(document.querySelectorAll('.recipe-card'));
    var count = document.getElementById('result-count'), empty = document.getElementById('empty-state');
    function run() {
      var n = sf.recipe.value.trim().toLowerCase(), i = sf.ingredient.value.trim().toLowerCase(), c = sf.course.value, shown = 0;
      cards.forEach(function (card) {
        var ok = card.dataset.name.indexOf(n) > -1 && card.dataset.ingredients.indexOf(i) > -1 && (!c || card.dataset.course === c);
        card.hidden = !ok; if (ok) shown++;
      });
      count.textContent = shown + (shown === 1 ? ' recipe found' : ' recipes found');
      empty.hidden = shown !== 0;
    }
    sf.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    sf.addEventListener('input', run);
    sf.addEventListener('reset', function () { setTimeout(run, 0); });
    run();
  }

  /* favorite toggle (details + browse cards) */
  document.querySelectorAll('[data-fav]').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.classList.toggle('is-on');
      b.setAttribute('aria-pressed', on);
      b.textContent = on ? '♥ Saved to favorites' : '♡ Add to favorites';
      var st = document.getElementById('fav-status');
      if (st) { st.hidden = false; st.className = 'alert ' + (on ? 'alert-success' : ''); st.textContent = on ? 'Added to your favorites.' : 'Removed from your favorites.'; }
    });
  });

  /* favorites page: remove */
  var favList = document.getElementById('fav-list');
  if (favList) {
    var fc = document.getElementById('fav-count'), fe = document.getElementById('fav-empty');
    function upd() { var n = favList.querySelectorAll('.recipe-card').length; fc.textContent = n + (n === 1 ? ' saved recipe' : ' saved recipes'); fe.hidden = n !== 0; }
    favList.addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]'); if (!b) return;
      b.closest('.recipe-card').remove(); upd();
      // var m = document.getElementById('fav-msg'); m.hidden = false; m.textContent = 'Recipe removed from your favorites.';
    });
    upd();
  }

  /* admin: delete with confirm */
  var tb = document.getElementById('admin-rows');
  if (tb) {
    var ae = document.getElementById('admin-empty'), pending = null, box = document.getElementById('confirm-box');
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('[data-delete]'); if (!b) return;
      pending = b.closest('tr');
      document.getElementById('confirm-name').textContent = pending.dataset.name;
      box.hidden = false; box.focus();
    });
    document.getElementById('confirm-no').addEventListener('click', function () { box.hidden = true; pending = null; });
    document.getElementById('confirm-yes').addEventListener('click', function () {
      if (pending) { pending.remove(); var m = document.getElementById('admin-msg'); m.hidden = false; m.textContent = 'Recipe deleted.'; }
      box.hidden = true; pending = null;
      ae.hidden = tb.children.length !== 0;
      document.getElementById('admin-count').textContent = tb.children.length;
    });
  }

  /* recipe form: add/remove ingredient rows, edit mode, save message */
  var rf = document.getElementById('recipe-form');
  if (rf) {
    var rows = document.getElementById('ing-rows');
    if (new URLSearchParams(location.search).get('mode') === 'edit') {
      document.getElementById('form-title').textContent = 'Edit recipe';
      document.getElementById('form-id').textContent = 'Editing recipe ID R-104';
    }
    function fix() { var all = rows.querySelectorAll('.ing-row'); all.forEach(function (r) { r.querySelector('.rm').disabled = all.length === 1; }); }
    document.getElementById('add-ing').addEventListener('click', function () {
      var c = rows.querySelector('.ing-row').cloneNode(true);
      c.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      rows.appendChild(c); fix(); c.querySelector('input').focus();
    });
    rows.addEventListener('click', function (e) { var b = e.target.closest('.rm'); if (b && !b.disabled) { b.closest('.ing-row').remove(); fix(); } });
    rf.addEventListener('submit', function (e) {
      e.preventDefault(); var m = document.getElementById('form-msg'); m.hidden = false; m.textContent = 'Recipe saved.'; m.scrollIntoView({ block: 'center' });
    });
    fix();
  }
})();
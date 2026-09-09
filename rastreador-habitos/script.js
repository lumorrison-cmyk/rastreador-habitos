const STORAGE_KEY = 'habitos-v1';
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(offset = 0) {
  const start = startOfWeek(new Date());
  start.setDate(start.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function computeStreak(habit) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = new Date(today);

  if (!habit.checks[toDateStr(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (habit.checks[toDateStr(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

let habits = loadHabits();
let weekOffset = 0;

const habitList = document.getElementById('habitList');
const emptyState = document.getElementById('emptyState');
const addForm = document.getElementById('addForm');
const habitInput = document.getElementById('habitInput');
const weekLabel = document.getElementById('weekLabel');
const summary = document.getElementById('summary');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappModal = document.getElementById('whatsappModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const phoneInput = document.getElementById('phoneInput');
const timeInput = document.getElementById('timeInput');
const whatsappHabitPreview = document.getElementById('whatsappHabitPreview');
const loadConfigBtn = document.getElementById('loadConfigBtn');
const loadConfigFile = document.getElementById('loadConfigFile');
const saveConfigBtn = document.getElementById('saveConfigBtn');

function render() {
  habitList.innerHTML = '';
  emptyState.hidden = habits.length > 0;

  const weekDates = getWeekDates(weekOffset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });
  weekLabel.textContent = weekOffset === 0
    ? `Semana de ${monthFmt.format(weekDates[0])}`
    : `Semana de ${monthFmt.format(weekDates[0])} a ${monthFmt.format(weekDates[6])}`;
  nextWeekBtn.disabled = weekOffset >= 0;

  habits.forEach(habit => {
    const card = document.createElement('div');
    card.className = 'habit-card';

    const top = document.createElement('div');
    top.className = 'habit-top';

    const name = document.createElement('div');
    name.className = 'habit-name';
    name.textContent = habit.name;
    name.title = 'Clique para renomear';
    name.onclick = () => startEditingName(name, habit);

    const meta = document.createElement('div');
    meta.className = 'habit-meta';

    const streak = document.createElement('div');
    streak.className = 'streak';
    const streakCount = computeStreak(habit);
    streak.textContent = streakCount > 0 ? `🔥 ${streakCount}` : '';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = '✎';
    editBtn.title = 'Renomear hábito';
    editBtn.onclick = () => startEditingName(name, habit);

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn delete-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Remover hábito';
    delBtn.onclick = () => {
      if (!confirm(`Remover o hábito "${habit.name}"? Isso apaga todo o histórico dele.`)) return;
      habits = habits.filter(h => h.id !== habit.id);
      saveHabits(habits);
      render();
    };

    meta.appendChild(streak);
    meta.appendChild(editBtn);
    meta.appendChild(delBtn);
    top.appendChild(name);
    top.appendChild(meta);

    const daysRow = document.createElement('div');
    daysRow.className = 'days-row';

    weekDates.forEach(date => {
      const dateStr = toDateStr(date);
      const cell = document.createElement('div');
      cell.className = 'day-cell';

      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = DAY_LABELS[date.getDay()];

      const checkbox = document.createElement('button');
      const isToday = toDateStr(date) === toDateStr(today);
      const isChecked = !!habit.checks[dateStr];

      checkbox.className = 'day-checkbox';
      if (isToday) checkbox.classList.add('today');
      if (isChecked) checkbox.classList.add('checked');
      checkbox.textContent = isChecked ? '✓' : '';

      checkbox.onclick = () => {
        if (habit.checks[dateStr]) {
          delete habit.checks[dateStr];
        } else {
          habit.checks[dateStr] = true;
        }
        saveHabits(habits);
        render();
      };

      cell.appendChild(label);
      cell.appendChild(checkbox);
      daysRow.appendChild(cell);
    });

    card.appendChild(top);
    card.appendChild(daysRow);
    habitList.appendChild(card);
  });

  renderSummary(weekDates);
}

function startEditingName(nameEl, habit) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'habit-name-input';
  input.value = habit.name;
  input.maxLength = 40;

  const commit = () => {
    const newName = input.value.trim();
    if (newName) habit.name = newName;
    saveHabits(habits);
    render();
  };

  input.onblur = commit;
  input.onkeydown = e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { input.onblur = null; render(); }
  };

  nameEl.replaceWith(input);
  input.focus();
  input.select();
}

function renderSummary(weekDates) {
  if (habits.length === 0) {
    summary.textContent = '';
    return;
  }
  const totalPossible = habits.length * weekDates.length;
  const totalDone = habits.reduce((sum, h) => {
    return sum + weekDates.filter(d => h.checks[toDateStr(d)]).length;
  }, 0);
  const pct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  summary.textContent = `${totalDone} de ${totalPossible} marcações nesta semana (${pct}%)`;
}

addForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = habitInput.value.trim();
  if (!name) return;
  habits.push({ id: Date.now().toString(), name, checks: {} });
  saveHabits(habits);
  habitInput.value = '';
  weekOffset = 0;
  render();
});

prevWeekBtn.addEventListener('click', () => {
  weekOffset -= 1;
  render();
});

nextWeekBtn.addEventListener('click', () => {
  if (weekOffset < 0) weekOffset += 1;
  render();
});

exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(habits, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = toDateStr(new Date());
  a.href = url;
  a.download = `habitos-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', () => {
  const file = importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error('formato inválido');
      const valid = imported.every(h => h && typeof h.name === 'string' && typeof h.checks === 'object');
      if (!valid) throw new Error('formato inválido');

      const replace = confirm(
        'Importar dados: clique OK para SUBSTITUIR todos os hábitos atuais, ou Cancelar para MESCLAR com os existentes.'
      );

      if (replace) {
        habits = imported.map(h => ({
          id: h.id || Date.now().toString() + Math.random(),
          name: h.name,
          checks: h.checks || {},
        }));
      } else {
        imported.forEach(h => {
          habits.push({
            id: Date.now().toString() + Math.random(),
            name: h.name,
            checks: h.checks || {},
          });
        });
      }

      saveHabits(habits);
      weekOffset = 0;
      render();
    } catch (err) {
      alert('Não foi possível importar: arquivo inválido.');
    } finally {
      importFile.value = '';
    }
  };
  reader.readAsText(file);
});

function openWhatsappModal() {
  whatsappHabitPreview.innerHTML = '';
  if (habits.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhum hábito cadastrado ainda.';
    whatsappHabitPreview.appendChild(li);
  } else {
    habits.forEach(h => {
      const li = document.createElement('li');
      li.textContent = h.name;
      whatsappHabitPreview.appendChild(li);
    });
  }
  whatsappModal.hidden = false;
}

function closeWhatsappModal() {
  whatsappModal.hidden = true;
}

whatsappBtn.addEventListener('click', openWhatsappModal);
closeModalBtn.addEventListener('click', closeWhatsappModal);
whatsappModal.addEventListener('click', e => {
  if (e.target === whatsappModal) closeWhatsappModal();
});

loadConfigBtn.addEventListener('click', () => loadConfigFile.click());

loadConfigFile.addEventListener('change', () => {
  const file = loadConfigFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const config = JSON.parse(reader.result);
      apiKeyInput.value = config.callmebotApiKey || '';
      phoneInput.value = config.whatsappPhone || '';
      timeInput.value = config.reminderTime || '08:00';
    } catch (err) {
      alert('Não foi possível ler o arquivo: formato inválido.');
    } finally {
      loadConfigFile.value = '';
    }
  };
  reader.readAsText(file);
});

saveConfigBtn.addEventListener('click', () => {
  const config = {
    callmebotApiKey: apiKeyInput.value.trim(),
    whatsappPhone: phoneInput.value.trim(),
    reminderTime: timeInput.value || '08:00',
    habits: habits.map(h => h.name),
  };

  if (!config.callmebotApiKey || !config.whatsappPhone) {
    alert('Preencha a chave de API e o número de WhatsApp antes de baixar.');
    return;
  }

  const data = JSON.stringify(config, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'whatsapp-config.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

render();

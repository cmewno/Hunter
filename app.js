// Конфигурация
const DAILY_QUESTS = [
    { id: 'pushups', name: 'Отжимания 3x20', exp: 30 },
    { id: 'squats', name: 'Приседания 3x25', exp: 25 },
    { id: 'reading', name: 'Прочитать 20 страниц', exp: 20 },
    { id: 'water', name: 'Выпить 2 литра воды', exp: 15 },
    { id: 'meditation', name: 'Медитация 10 минут', exp: 20 }
];

// Инициализация данных
if (!localStorage.getItem('user')) {
    const defaultUser = {
        level: 1,
        exp: 0,
        rank: 'E',
        streak: 0,
        lastDate: '',
        questsCompletedToday: []
    };
    localStorage.setItem('user', JSON.stringify(defaultUser));
}

let user = JSON.parse(localStorage.getItem('user'));

// Проверка нового дня (сброс заданий)
const today = new Date().toDateString();
if (user.lastDate !== today) {
    // Если не вчера – обнуляем стрик
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (user.lastDate !== yesterday) {
        user.streak = 0;
    }
    user.lastDate = today;
    user.questsCompletedToday = [];
    saveUser();
}

// Функция сохранения
function saveUser() {
    localStorage.setItem('user', JSON.stringify(user));
}

// Расчет ранга
function calculateRank() {
    if (user.level >= 50) return 'S';
    if (user.level >= 30) return 'A';
    if (user.level >= 20) return 'B';
    if (user.level >= 10) return 'C';
    if (user.level >= 5) return 'D';
    return 'E';
}

// Обработка выполнения квеста
function completeQuest(questId) {
    if (user.questsCompletedToday.includes(questId)) return; // уже сделан
    
    const quest = DAILY_QUESTS.find(q => q.id === questId);
    user.exp += quest.exp;
    user.questsCompletedToday.push(questId);

    // Проверка повышения уровня
    const expForNextLevel = user.level * 100;
    if (user.exp >= expForNextLevel) {
        user.exp -= expForNextLevel;
        user.level++;
        user.rank = calculateRank();
        alert(`⚡ Поздравляем! Уровень повышен до ${user.level}. Ранг: ${user.rank}`);
        // можно добавить вибрацию
        if (navigator.vibrate) navigator.vibrate(200);
    }

    // Проверка, все ли квесты выполнены (для стрика)
    if (user.questsCompletedToday.length === DAILY_QUESTS.length) {
        if (user.lastDate !== today) { // первый раз сегодня
            user.streak++;
        }
    }

    saveUser();
    render();
}

// Рендеринг интерфейса
function render() {
    document.getElementById('level').textContent = user.level;
    document.getElementById('exp').textContent = user.exp;
    document.getElementById('streak').textContent = user.streak;
    document.getElementById('rank').textContent = `Ранг: ${user.rank}`;

    const questList = document.getElementById('quest-list');
    questList.innerHTML = DAILY_QUESTS.map(quest => {
        const completed = user.questsCompletedToday.includes(quest.id);
        return `
            <li class="quest-item ${completed ? 'completed' : ''}">
                <span>${quest.name} (${quest.exp} XP)</span>
                <button ${completed ? 'disabled' : ''} 
                        onclick="completeQuest('${quest.id}')">
                    ${completed ? '✓ Выполнено' : 'Выполнить'}
                </button>
            </li>
        `;
    }).join('');
}

// Функция штрафа (пример: если до 23:00 не выполнил все, срабатывает напоминание)
// Можно добавить позже, сейчас просто стрик сбрасывается при неполном выполнении.

// Первоначальный рендер
render();

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
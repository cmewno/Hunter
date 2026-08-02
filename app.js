// ========== ПУЛ ВСЕХ ВОЗМОЖНЫХ ЗАДАНИЙ ==========
const QUEST_POOL = [
    { id: 'pushups', name: 'Отжимания 3x20', exp: 30 },
    { id: 'squats', name: 'Приседания 3x25', exp: 25 },
    { id: 'pullups', name: 'Турник 3x8 (или подтягивания)', exp: 35 },
    { id: 'abs', name: 'Пресс 3x30', exp: 25 },
    { id: 'plank', name: 'Планка 2 минуты', exp: 20 },
    { id: 'reading', name: 'Прочитать 20 страниц', exp: 20 },
    { id: 'water', name: 'Выпить 2 литра воды', exp: 15 },
    { id: 'meditation', name: 'Медитация 10 минут', exp: 20 },
    { id: 'stretching', name: 'Растяжка 15 минут', exp: 15 },
    { id: 'jump_rope', name: 'Скакалка 5 минут', exp: 20 },
    { id: 'learning', name: 'Учить что-то новое 20 минут', exp: 25 },
    { id: 'cleaning', name: 'Уборка 15 минут', exp: 10 }
];

const DAILY_QUESTS_COUNT = 5; // сколько заданий в день

// ========== ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ ==========
if (!localStorage.getItem('user')) {
    const defaultUser = {
        level: 1,
        exp: 0,
        rank: 'E',
        streak: 0,
        lastDate: '',
        questsCompletedToday: [],
        dailyQuests: [],       // сегодняшний список заданий
        statPoints: 0,        // очки характеристик
        strength: 0,
        intelligence: 0,
        endurance: 0,
        allDoneToday: false   // флаг, что уже получал очки за всё
    };
    localStorage.setItem('user', JSON.stringify(defaultUser));
}

let user = JSON.parse(localStorage.getItem('user'));

// ========== ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЗАДАНИЙ ==========
function generateDailyQuests() {
    // Перемешиваем пул и берём первые DAILY_QUESTS_COUNT
    const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, DAILY_QUESTS_COUNT);
}

// ========== ПРОВЕРКА НОВОГО ДНЯ ==========
const today = new Date().toDateString();
if (user.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (user.lastDate !== yesterday) {
        user.streak = 0;
    }
    // Сбрасываем на новый день
    user.lastDate = today;
    user.questsCompletedToday = [];
    user.dailyQuests = generateDailyQuests();
    user.allDoneToday = false;
    // Очки характеристик не сбрасываем, они копятся
    saveUser();
} else if (!user.dailyQuests || user.dailyQuests.length === 0) {
    // Если почему-то пустой список (первый запуск сегодня)
    user.dailyQuests = generateDailyQuests();
    saveUser();
}

// ========== СОХРАНЕНИЕ ==========
function saveUser() {
    localStorage.setItem('user', JSON.stringify(user));
}

// ========== ОПРЕДЕЛЕНИЕ РАНГА ==========
function calculateRank() {
    if (user.level >= 50) return 'S';
    if (user.level >= 30) return 'A';
    if (user.level >= 20) return 'B';
    if (user.level >= 10) return 'C';
    if (user.level >= 5) return 'D';
    return 'E';
}

// ========== СИСТЕМНОЕ СООБЩЕНИЕ ==========
function showSystemMessage(text, callback) {
    const msgBox = document.getElementById('system-message');
    const msgText = msgBox.querySelector('.msg-text');
    msgText.textContent = text;
    msgBox.classList.add('show');
    
    const btn = msgBox.querySelector('button');
    btn.onclick = () => {
        msgBox.classList.remove('show');
        if (callback) callback();
    };
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// ========== ВЫПОЛНЕНИЕ КВЕСТА ==========
function completeQuest(questId) {
    if (user.questsCompletedToday.includes(questId)) return;
    
    const quest = user.dailyQuests.find(q => q.id === questId);
    if (!quest) return; // такого задания нет в сегодняшнем списке
    
    user.exp += quest.exp;
    user.questsCompletedToday.push(questId);
    
    // Проверка повышения уровня
    const expForNextLevel = user.level * 100;
    if (user.exp >= expForNextLevel) {
        user.exp -= expForNextLevel;
        user.level++;
        user.rank = calculateRank();
        showSystemMessage(`⚡ Уровень повышен до ${user.level}. Ранг: ${user.rank}`);
    }
    
    // Проверка, все ли задания выполнены сегодня
    if (!user.allDoneToday && user.questsCompletedToday.length === user.dailyQuests.length) {
        // Награда: +1 очко характеристик
        user.statPoints += 1;
        user.allDoneToday = true;
        // Обновляем стрик (только если раньше не учтён)
        if (user.streak === 0 || user.lastDate !== today) {
            user.streak++;
        }
        showSystemMessage('🎯 Все задания дня выполнены! Получено 1 очко характеристик.');
    }
    
    saveUser();
    render();
}

// ========== РАСПРЕДЕЛЕНИЕ ОЧКОВ ХАРАКТЕРИСТИК ==========
function addStat(stat) {
    if (user.statPoints <= 0) return;
    user.statPoints--;
    if (stat === 'strength') user.strength++;
    else if (stat === 'intelligence') user.intelligence++;
    else if (stat === 'endurance') user.endurance++;
    saveUser();
    render();
}

// ========== ОТРИСОВКА ==========
function render() {
    document.getElementById('level').textContent = user.level;
    document.getElementById('exp').textContent = user.exp;
    document.getElementById('exp-max').textContent = user.level * 100;
    document.getElementById('streak').textContent = `🔥 ${user.streak}`;
    document.getElementById('rank').textContent = `Ранг: ${user.rank}`;
    
    // Прогресс-бар опыта
    const expPercent = (user.exp / (user.level * 100)) * 100;
    document.getElementById('exp-bar').style.width = expPercent + '%';
    
    // Характеристики
    document.getElementById('attr-strength').textContent = user.strength;
    document.getElementById('attr-intelligence').textContent = user.intelligence;
    document.getElementById('attr-endurance').textContent = user.endurance;
    document.getElementById('attr-points').textContent = `Доступно очков: ${user.statPoints}`;
    
    // Кнопки распределения
    const buttons = document.querySelectorAll('.attr-btn');
    buttons.forEach(btn => {
        if (user.statPoints > 0) {
            btn.disabled = false;
            btn.style.opacity = '1';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.4';
        }
    });
    
    // Список заданий
    const questList = document.getElementById('quest-list');
    questList.innerHTML = user.dailyQuests.map(quest => {
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

// ========== НАЗНАЧАЕМ ОБРАБОТЧИКИ НА КНОПКИ ХАРАКТЕРИСТИК ==========
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.attr-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const stat = this.getAttribute('data-attr');
            addStat(stat);
        });
    });
});

// ========== ПЕРВЫЙ РЕНДЕР ==========
render();

// ========== SERVICE WORKER (PWA) ==========
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
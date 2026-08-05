// ========== ПУЛ ЕЖЕДНЕВНЫХ ЗАДАНИЙ ==========
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

const DAILY_QUESTS_COUNT = 5;

// ========== ТРЕНИРОВОЧНЫЙ ПЛАН ==========
const TRAINING_PLAN = {
    1: { // Понедельник
        name: 'Грудь + Спина',
        exercises: [
            'Разминка: 5 минут (вращения плеч, локтей, легкие отжимания, вис на турнике)',
            'Подтягивания широким хватом — 4×6–10',
            'Жим гантелей лежа на скамье — 4×8–12',
            'Тяга гантели в наклоне одной рукой — 4×10–12 на каждую руку',
            'Разведение гантелей лежа — 3×10–15',
            'Горизонтальные подтягивания или тяга двух гантелей в наклоне — 3×10–12',
            'Планка — 3×45–60 секунд'
        ]
    },
    2: { // Вторник
        name: 'Плечи + Руки',
        exercises: [
            'Разминка: 5 минут',
            'Жим гантелей сидя — 4×8–12',
            'Подъем гантелей в стороны — 3×12–15',
            'Подъем гантелей на бицепс — 4×8–12',
            'Молотковые сгибания — 3×10–12',
            'Французский жим гантели сидя — 4×10–12',
            'Обратные отжимания от скамьи — 3×12–15'
        ]
    },
    5: { // Пятница
        name: 'Верх тела (силовой день)',
        exercises: [
            'Разминка: 5 минут',
            'Подтягивания с доп. весом или обычные — 5×5–8',
            'Жим гантелей лежа тяжелее — 5×5–8',
            'Тяга двух гантелей в наклоне — 4×8–10',
            'Жим гантелей сидя — 3×8–10',
            'Подъем гантелей на бицепс — 3×8–10',
            'Французский жим — 3×8–10'
        ]
    }
};

// ========== ЗАГРУЗКА И МИГРАЦИЯ ДАННЫХ ==========
function loadUser() {
    let saved = localStorage.getItem('user');
    let user = saved ? JSON.parse(saved) : null;

    // Значения по умолчанию для всех полей
    const defaults = {
        level: 1,
        exp: 0,
        gold: 0,
        rank: 'E',
        streak: 0,
        lastDate: '',
        questsCompletedToday: [],
        dailyQuests: [],
        statPoints: 0,
        strength: 0,
        intelligence: 0,
        endurance: 0,
        allDoneToday: false,
        trainingCompletedToday: false
    };

    if (!user) {
        // Новый пользователь
        user = { ...defaults };
    } else {
        // Добавляем отсутствующие поля (миграция старых данных)
        for (let key in defaults) {
            if (user[key] === undefined) {
                user[key] = defaults[key];
            }
        }
    }

    return user;
}

let user = loadUser();

// ========== ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЗАДАНИЙ ==========
function generateDailyQuests() {
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
    user.lastDate = today;
    user.questsCompletedToday = [];
    user.dailyQuests = generateDailyQuests();
    user.allDoneToday = false;
    user.trainingCompletedToday = false;
    saveUser();
} else if (!user.dailyQuests || user.dailyQuests.length === 0) {
    user.dailyQuests = generateDailyQuests();
    saveUser();
}

// ========== СОХРАНЕНИЕ ==========
function saveUser() {
    localStorage.setItem('user', JSON.stringify(user));
}

// ========== РАНГ ==========
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
    if (!quest) return;
    
    user.exp += quest.exp;
    user.gold += quest.exp;
    user.questsCompletedToday.push(questId);
    
    const expForNextLevel = user.level * 100;
    if (user.exp >= expForNextLevel) {
        user.exp -= expForNextLevel;
        user.level++;
        user.rank = calculateRank();
        showSystemMessage(`⚡ Уровень повышен до ${user.level}. Ранг: ${user.rank}`);
    }
    
    if (!user.allDoneToday && user.questsCompletedToday.length === user.dailyQuests.length) {
        user.statPoints += 1;
        user.allDoneToday = true;
        showSystemMessage('🎯 Все задания дня выполнены! Получено 1 очко характеристик.');
        if (user.streak === 0 || user.lastDate !== today) {
            user.streak++;
        }
    }
    
    saveUser();
    render();
}

// ========== ТРЕНИРОВКА ==========
function completeTraining() {
    if (user.trainingCompletedToday) return;
    
    const trainingRewardExp = 100;
    const trainingRewardGold = 50;
    
    user.exp += trainingRewardExp;
    user.gold += trainingRewardGold;
    user.trainingCompletedToday = true;
    
    const expForNextLevel = user.level * 100;
    if (user.exp >= expForNextLevel) {
        user.exp -= expForNextLevel;
        user.level++;
        user.rank = calculateRank();
        showSystemMessage(`⚡ Уровень повышен до ${user.level}. Ранг: ${user.rank}`);
    } else {
        showSystemMessage(`🏋️ Тренировка завершена! +${trainingRewardExp} опыта, +${trainingRewardGold} золота.`);
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
    
    const expPercent = (user.exp / (user.level * 100)) * 100;
    document.getElementById('exp-bar').style.width = expPercent + '%';
    
    document.getElementById('attr-strength').textContent = user.strength;
    document.getElementById('attr-intelligence').textContent = user.intelligence;
    document.getElementById('attr-endurance').textContent = user.endurance;
    document.getElementById('attr-points').textContent = `Доступно очков: ${user.statPoints}`;
    
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
    
    // Ежедневные задания
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
    
    // Тренировочная панель
    const trainingPanel = document.getElementById('training-panel');
    const trainingContent = document.getElementById('training-content');
    const completeBtn = document.getElementById('complete-training');
    
    const dayOfWeek = new Date().getDay(); // 1 = ПН, 2 = ВТ, ..., 5 = ПТ
    const todayTraining = TRAINING_PLAN[dayOfWeek];
    
    if (todayTraining) {
        trainingPanel.classList.remove('hidden');
        trainingContent.innerHTML = `
            <p style="color:#ffaa00; margin-bottom:10px;">📅 ${todayTraining.name}</p>
            ${todayTraining.exercises.map(ex => `<div class="training-exercise">${ex}</div>`).join('')}
        `;
        if (user.trainingCompletedToday) {
            completeBtn.textContent = '✅ Тренировка выполнена';
            completeBtn.disabled = true;
        } else {
            completeBtn.textContent = '✅ Завершить тренировку (+100 XP, +50 💰)';
            completeBtn.disabled = false;
        }
    } else {
        trainingPanel.classList.add('hidden');
    }
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
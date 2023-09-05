export function tr(s: string): string {
    return {
        "Unknown": "Неизвестная команда",

        "Welcome to the Startup House!": "Добро пожаловать в стартап-хаус! После начала нетворкинга этот бот пришлет вам дальнейшие инструкции.",
        "You were added to the networking": "Вы добавлены в нетворкинг! Ожидайте инструкций.",
        "Go to position": "Пожалуйста, перейдите в точку номер",
        "You skip this round": "В этом раунде для вас не нашлось пары 😢",
        "Time is up": "Время вышло! Спасибо за участие!",

        "Start": "Начать нетворкинг",
        "Cancel": "Отменить",
        "Select user": "Выбрать пользователя",
        "Select group": "Выбрать чат",
        "Send me a contact": "Пришлите контакт",
        "Received contact": "Получил контакт",
        "Not a contact": "Не удалось найти контакт",
        "Members": "Участники",
        "Next pair": "Следующая пара",
        "Finish": "Закончить",
        "Starting round": "Начинаем раунд",
        "Networking finished": "Нетворкинг завершен",
    }[s] ?? s;
}

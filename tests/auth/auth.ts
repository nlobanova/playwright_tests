// можешь не переделывать, т.к. уже реализовано в основной репе, комменты пишу для твоего понимания
import { type Locator, type Page } from '@playwright/test'; // Locator не используется, старайся неиспользуемые импорты убирать

export class Auth { // page object'ы лучше называть соответсвующее AuthPage/LoginPage , чтобы было понятно, за что отвечает класс
    
  readonly page: Page;

    constructor(page: Page) {
      this.page = page;
    }

    public async login(): Promise <void> {
      const login = process.env.LOGIN; // а если тебе захочется потом под другим пользователем с другими ролями авторизоваться - лучше прокидывать в метод такие данные
      const password = process.env.PASSWORD;
      await this.page.goto('/')
      if ( !login || !password) { // думаю такие ошибки лучше не обрабатывать, т.к. вряд ли их кто-то удалит, они могут протухнуть, но отсутствовать - вряд ли
        throw new Error('Отсутствуют login и password в .env');
      }
      await this.page.locator('[formcontrolname="login"]').locator('[inputmode="text"]').fill(login); // основные локаторы лучше выносить в поля класса
      await this.page.getByLabel('Password').fill(password); // лучше не привязываться к тексту при выборе локаторов
      await this.page.getByRole('button', { name: 'Log in' }).click(); // аналогично
      await this.page.waitForURL('**/new/catalog/projects');
    }; 
};
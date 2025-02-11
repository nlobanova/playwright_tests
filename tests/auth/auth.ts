import { type Locator, type Page } from '@playwright/test';

export class Auth {
    
  readonly page: Page;

    constructor(page: Page) {
      this.page = page;
    }

    public async login(): Promise <void> {
      const login = process.env.LOGIN;
      const password = process.env.PASSWORD;
      await this.page.goto('/')
      if ( !login || !password) {           
        throw new Error('Отсутствуют login и password в .env');
      }
      await this.page.locator('[formcontrolname="login"]').locator('[inputmode="text"]').fill(login);
      await this.page.getByLabel('Password').fill(password);
      await this.page.getByRole('button', { name: 'Log in' }).click();
      await this.page.waitForURL('**/new/catalog/projects');
    }; 
};
// почему расширение specs в названии файлов? spec используется для файлов теста
import { type Locator, type Page, expect, Response } from '@playwright/test'; // неиспользуемый импорт
 
export class ContractsPage {
  // лишний пропуск строчки
  public readonly page: Page;
  public readonly _filterByCurrentUser: Locator; // почему с _ начинаются? Есть практика так именовать приватные поля, но не публичные
  public readonly _contractCard: Locator;
  public readonly _sorting: Locator;
  public readonly _currentUser: Locator;
  public readonly _searchInput: Locator;
  public readonly _deleteButton: Locator;
  public readonly _confirm: Locator; // лучше все поля существительными делать confirmButton, просто confirm - как будто название метода

    constructor(page: Page) { // что за доп. отступ?
      this.page = page;
      this._filterByCurrentUser = this.page.locator('pb-checkbox');
      this._contractCard = this.page.locator('pb-contract-card');
      this._sorting = this.page.locator('.sorting');
      this._currentUser = this.page.getByRole('navigation').locator('[class="user-name"]');
      this._searchInput = this.page.locator('[formcontrolname="query"]').locator('[inputmode="text"]');
      this._deleteButton = this._contractCard.first().locator('[type="confirmation"]').getByRole('button');
      this._confirm = this.page.locator('pb-confirmation').getByRole('button', { name: 'Удалить' }); // привязка к тексту
    };

    public async openContractsPage(): Promise<void> { // избыточно contractsPage.openContractsPage() , лучше просто open()
      await this.page.goto('/new/contracts');
      await this._contractCard.first().waitFor(); // а точно ли должны быть договоры? Мб к запросу лучше привязаться? (не крит)
    };

    public async getListFromResponse(responseBody: JSON, key: string): Promise<string[]> { // лучше вынести в отдельную утилку, т.к. может использоваться и на других страницах
      
      let list : string[] = [];

      let countElements = Object.keys(responseBody['hydra:member']).length;
      
        for (let index = 0; index < countElements; index++) {
          list.push(responseBody['hydra:member'][index][key].trim());
        };

      return(list);

    };

    public async getListFromPage(parameter: string): Promise<string[]> { // лучше в названии уточнить список чего
      
      let list : string[] = [];
      await this._contractCard.first().waitFor();
      const countElements = await this._contractCard.count();

        for (let index = 0; index < countElements; index++) {
          let locatorText: string | null;
          
          switch (parameter) {
            case 'title':
              locatorText = await this.page.locator('h2').nth(index).textContent(); // лучше чейнить относительно локатора карточки договора, а не страницы, а то добавят еще что-то, где будет тэги h2 и все сломается
              break;
            case 'user':
              locatorText = await this.page.locator('.bottom').nth(index).getByRole('paragraph').first().textContent();
              break;
            case 'date':
              locatorText = await this.page.locator('.bottom').nth(index).getByRole('paragraph').nth(1).textContent();
              break;
            default:
              throw new Error(`Некорректный параметр: ${parameter}`);
          }
      
          list.push(locatorText?.trim() ?? '');
        };

      return(list);
    };

    public async sortByDate(parameter: string): Promise<string[]> {
        await this._sorting.click();
    // необязательно так строчки разделять, делает методы оч. длинными
        const sortingOptions: { [key: string]: string } = { // лучше enum'ом
          updatedAtAsc: 'Дата изменения: Сначала старые',
          updatedAtDesc: 'Дата изменения: Сначала новые',
          createdAtAsc: 'Дата создания: Сначала старые',
          createdAtDesc: 'Дата создания: Сначала новые',
        };
    
    
        await this.page.getByText(sortingOptions[parameter]).click();
    
        const response = await this.page.waitForResponse(response => response.url().includes('/contracts'));
    
        const data = await response.json();

        
        const listTitleFromResponse = await this.getListFromResponse(data, 'title');

        const field = parameter.includes('updated') ? 'updatedAt' : 'createdAt';
        const listDateFromResponse = await this.getListFromResponse(data, field);
    
        const dates = listDateFromResponse.map(str => new Date(str));
    
        const sortedDates = [...dates].sort((a, b) => {
          return parameter.endsWith('Asc') ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
        });
    
        expect(dates).toEqual(sortedDates); // все expect'ы лучше в файле теста всегда делать
    
        return listTitleFromResponse;
    }

    public async filterByUser (): Promise<void> { //лишний пробел
      
      const responsePromise = this.page.waitForResponse(response => response.url().includes('/contracts'));
      await this._filterByCurrentUser.click();
      const response = await responsePromise; 
      /*
      Можно более компактно 
      
      await Promise.all([
            this.page.waitForResponse(response => response.url().includes('/contracts')),
            this._filterByCurrentUser.click(),
      ]);
      
      */
    };

    public async getNameCurrentUser (): Promise<string> { // кажется что логичнее getCurrentUserName с точки зрения языка
      
      const currentUserName = await this._currentUser.textContent(); // можно использовать innerText, он не возвращает null и можно без !
      return currentUserName!;
      
    };

    public async searchContract (query: string): Promise<void> {

      const responsePromise = this.page.waitForResponse(response => response.url().includes('/contracts'));
      await this._searchInput.fill(query);
      const response = await responsePromise;

    };

    public async deleteContract (): Promise<void> {

      await this._deleteButton.click();
      await this._confirm.click();

    };

};
import { type Locator, type Page, expect, Response } from '@playwright/test';

export class ContractsPage {
    
  public readonly page: Page;
  public readonly _filterByCurrentUser: Locator; 
  public readonly _contractCard: Locator;
  public readonly _sorting: Locator;
  public readonly _currentUser: Locator;
  public readonly _searchInput: Locator;
  public readonly _deleteButton: Locator;
  public readonly _confirm: Locator;

    constructor(page: Page) {
      this.page = page;
      this._filterByCurrentUser = this.page.locator('pb-checkbox');
      this._contractCard = this.page.locator('pb-contract-card');
      this._sorting = this.page.locator('.sorting');
      this._currentUser = this.page.getByRole('navigation').locator('[class="user-name"]');
      this._searchInput = this.page.locator('[formcontrolname="query"]').locator('[inputmode="text"]');
      this._deleteButton = this._contractCard.first().locator('[type="confirmation"]').getByRole('button');
      this._confirm = this.page.locator('pb-confirmation').getByRole('button', { name: 'Удалить' });
    };

    public async openContractsPage(): Promise<void> {
      await this.page.goto('/new/contracts');
      await this._contractCard.first().waitFor();
    }; 

    public async getListFromResponse(responseBody: JSON, key: string): Promise<string[]> {
      
      let list : string[] = [];

      let countElements = Object.keys(responseBody['hydra:member']).length;
      
        for (let index = 0; index < countElements; index++) {
          list.push(responseBody['hydra:member'][index][key].trim());
        };

      return(list);

    };

    public async getListFromPage(parameter: string): Promise<string[]> {
      
      let list : string[] = [];
      await this._contractCard.first().waitFor();
      const countElements = await this._contractCard.count();

        for (let index = 0; index < countElements; index++) {
          let locatorText: string | null;
      
          switch (parameter) {
            case 'title':
              locatorText = await this.page.locator('h2').nth(index).textContent();
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
    
        const sortingOptions: { [key: string]: string } = {
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
    
        expect(dates).toEqual(sortedDates);
    
        return listTitleFromResponse;
    }

    public async filterByUser (): Promise<void> {
      
      const responsePromise = this.page.waitForResponse(response => response.url().includes('/contracts'));
      await this._filterByCurrentUser.click();
      const response = await responsePromise;
      
    };

    public async getNameCurrentUser (): Promise<string> {
      
      const currentUserName = await this._currentUser.textContent();
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
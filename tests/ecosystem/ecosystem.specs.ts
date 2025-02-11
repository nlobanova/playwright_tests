import { type Locator, type Page, expect, BrowserContext } from '@playwright/test';
import * as fs from 'fs';

export class Ecosystem {
    
  public readonly page: Page;

    constructor(page: Page) {
      this.page = page;
    }


    public async saveAccessTokenSSO(): Promise<void> {
      let accessTokenSSO: string;

      interface TokenResponse {
          access_token: string;
      }

      this.page.on('response', async response => {
        if (response.url().includes('/token')) {
          const responseBody: TokenResponse = await response.json();
          accessTokenSSO = 'Bearer' + ' ' + responseBody.access_token;
          
          const accessToken: { [key: string]: any }= {
            "accessTokenSSO": accessTokenSSO
          }  

          fs.readFile('./tests/testsData.json', 'utf8', (err, fileContent) => {
            if (err) {
              console.error('Ошибка чтения файла:', err);
                return;
            }

            let existingData = {};
              
            try {
            existingData = JSON.parse(fileContent); 
            } catch (err) {
            console.error('Ошибка парсинга JSON:', err);
              return;
            }
                
            const updatedData = { ...existingData, ...accessToken };
              
            const updatedJson = JSON.stringify(updatedData, null, 2);
                
            fs.writeFile('./tests/testsData.json', updatedJson, 'utf8', (err) => {
              if (err) {
                console.error('Ошибка записи файла:', err);
              };
            });
          });
        }
      });
    };


    public async changeLanguage() {
      await this.page.locator('pb-language').click();
      await this.page.getByText('Русский').click();
    };

};
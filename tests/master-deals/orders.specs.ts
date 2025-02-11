import { type Page, APIRequestContext, expect } from '@playwright/test';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

export class OrdersAPI {
    
  readonly page: Page;
  readonly request: APIRequestContext;

    constructor(page: Page, request: APIRequestContext) {
      this.page = page;
      this.request = request;
    }

    public async getOrderByPropertyId(): Promise<void>{

      interface data {
        propertyId: string;
        accessTokenSSO: string;
      }
      
      let propertyId: string | undefined;
      let accessTokenSSO: string | undefined;
            
      async function getDataFromJSON(): Promise<void> {
        try {
          const data = await fs.promises.readFile('./tests/testsData.json', 'utf8');
          const jsonData: data = JSON.parse(data);
          propertyId = jsonData.propertyId;
          accessTokenSSO = jsonData.accessTokenSSO;
        } catch (err) {
          console.error('Ошибка при чтении файла:', err);
        }
      };
      
      await getDataFromJSON();

      if (accessTokenSSO && propertyId){
        const getOrderRequest = await this.request.get('/order-management/api/orders?propertyId=' + propertyId, {
            headers: {
              'Authorization': accessTokenSSO,
              'Content-Type': 'application/json'
            }
          });

        expect(getOrderRequest.status()).toBe(200);

        const response = await getOrderRequest.json();

        const orders: { [key: string]: any }= {
          "orderId": response['hydra:member'][0].id,
          "orderItemId": response['hydra:member'][0].orderItems[0].id
        };

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
            
          const updatedData = { ...existingData, ...orders };
            
          const updatedJson = JSON.stringify(updatedData, null, 2);
            
          fs.writeFile('./tests/testsData.json', updatedJson, 'utf8', (err) => {
              if (err) {
                console.error('Ошибка записи файла:', err);
              };
          });
        });
      };
    };

    public async createContract(): Promise<void> {

      interface data {
        accessTokenSSO: string;
        orderId: string;
        orderItemId: string;
      }
      
      let accessTokenSSO!: string;
      let orderId!: string;
      let orderItemId!: string;
            
      async function getDataFromJSON(): Promise<void> { 
        try {
          const data = await fs.promises.readFile('./tests/testsData.json', 'utf8');
          const jsonData: data = JSON.parse(data);
          accessTokenSSO = jsonData.accessTokenSSO;
          orderId = jsonData.orderId;
          orderItemId = jsonData.orderItemId;
        } catch (err) {
          console.error('Ошибка при чтении файла:', err);
        }
      };
      
      await getDataFromJSON();

      if (accessTokenSSO && orderId && orderItemId){
      const getAuthentication = await this.request.post('/contract-management/api/contracts', {
        headers: {
          'Authorization': accessTokenSSO,
          'Content-Type': 'application/json'
        },
        data: {
          "orderId": orderId,
          "orderItemId": orderItemId,
          "title": "AUTOTEST Контракт",
          "description": null,
          "userId": Number(process.env.USERID)
        }
      });
      
      expect(getAuthentication.status()).toBe(201);
    }; 
  };
};
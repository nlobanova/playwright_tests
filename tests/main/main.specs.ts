import { Page, APIRequestContext, expect } from '@playwright/test';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

export class MainAPI {
    readonly page: Page;
    readonly request: APIRequestContext;
  
    constructor(page: Page, request: APIRequestContext) {
      this.page = page;
      this.request = request;
    }

    public async getAccessToken():Promise<string>{
      const getAuthentication = await this.request.post('/api/v4/json/authentication', {
          data: {
              "type": "api-app",
              "credentials": {
                "pb_api_key": process.env.API_KEY
              }
          }
      });

      expect(getAuthentication.status()).toBe(200);
  
      const authenticationResponse = await getAuthentication.json();
      const accessToken = authenticationResponse.access_token;
      return(accessToken);
    };

    public async createProject(): Promise<void>{
      const accessToken = await this.getAccessToken();
      const createdProjectRequest = await this.request.post(`/api/v4/json/projects?access_token=`+accessToken, {
        data: {
          "title": "AUTOTEST Счастье",
          "type": "complex",
          "currency": "RUB"
        }    
      });

      expect(createdProjectRequest.status()).toBe(200);

      const createdProjectResponse = await createdProjectRequest.json();

      const createdProjectId: { [key: string]: any }= {
        "projectId": createdProjectResponse.id
      }  

      fs.readFile('./tests/testsData.json', 'utf8', (err, fileContent) => {
        if (err) {
          console.error('Ошибка чтения файла:', err);
          return;
        }
    
        let existingData = {};
        
        try {
          existingData = JSON.parse(fileContent);
        } catch (parseErr) {
          console.error('Ошибка парсинга JSON:', parseErr);
          return;
        }

        const updatedData = { ...existingData, ...createdProjectId };
    
        const updatedJson = JSON.stringify(updatedData, null, 2);
    
        fs.writeFile('./tests/testsData.json', updatedJson, 'utf8', (err) => {
          if (err) {
              console.error('Ошибка записи файла:', err);
          };
        });
      });
    };

    public async createHouse(): Promise<void>{

      const accessToken = await this.getAccessToken();
      
      interface project {
        projectId: string;
      }

      let projectId: string | undefined;
      
      async function getProjectIdFromJSON(): Promise<void> {
        try {
          const data = await fs.promises.readFile('./tests/testsData.json', 'utf8');
          const jsonData: project = JSON.parse(data);
          projectId = jsonData.projectId;
        } catch (err) {
          console.error('Ошибка при чтении файла:', err);
        }
      };

      await getProjectIdFromJSON();

      if (projectId){

        const createHouse = await this.request.post(`/api/v4/json/houses?access_token=`+accessToken, {
          data: {
            "project_id": projectId,
            "title": "AUTOTEST I Очередь"
          }
        });

        expect(createHouse.status()).toBe(200);

        const createdHouseResponse = await createHouse.json();

        const createdHouseId: { [key: string]: any }= {
          "houseId": createdHouseResponse.id
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
      
          const updatedData = { ...existingData, ...createdHouseId };
      
          const updatedJson = JSON.stringify(updatedData, null, 2);
      
          fs.writeFile('./tests/testsData.json', updatedJson, 'utf8', (err) => {
            if (err) {
                console.error('Ошибка записи файла:', err);
            };
          });
        });
      };
    };

    public async createProperty(): Promise<void>{

      const accessToken: string = await this.getAccessToken();

      interface house {
        houseId: string;
      }

      let houseId: string | undefined;
      
      async function getHouseIdFromJSON(): Promise<void> {
        try {
          const data = await fs.promises.readFile('./tests/testsData.json', 'utf8');
          const jsonData: house = JSON.parse(data);
          houseId = jsonData.houseId;
        } catch (err) {
          console.error('Ошибка при чтении файла:', err);
        }
      };

      await getHouseIdFromJSON();

      if (houseId){
      const createPropertyRequest = await this.request.post(`/api/v4/json/properties?access_token=`+accessToken, {
        data: {
          "house_id": houseId,
          "number": "1",
          "property_type": "apartment",
          "rooms_amount": "1",
          "section": "Подъезд 3",
          "floor": 1,
          "area": {
            "area_total": 60.2,
          },
          "status": "BOOKED",
          "price": {
            "value": 3200000
          }
        }
      });
      expect(createPropertyRequest.status()).toBe(200);

      const createdPropertyResponse = await createPropertyRequest.json();

      const createdPropertyId: { [key: string]: any }= {
        "propertyId": createdPropertyResponse.id
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
    
        const updatedData = { ...existingData, ...createdPropertyId };
    
        const updatedJson = JSON.stringify(updatedData, null, 2);
    
        fs.writeFile('./tests/testsData.json', updatedJson, 'utf8', (err) => {
            if (err) {
                console.error('Ошибка записи файла:', err);
            };
        });
      });
    };
  };
};
import { test, expect, _electron, BrowserContext, APIRequestContext} from "@playwright/test";
import { ContractsPage } from '../contracts/contracts-page.specs';
import { OrdersAPI } from '../master-deals/orders.specs';
import { MainAPI } from '../main/main.specs';
import { Ecosystem } from "../ecosystem/ecosystem.specs";
import { Auth } from "../auth/auth";
import * as dotenv from 'dotenv';

dotenv.config();

test.describe('Базовый сценарий работы в разделе Документы', async () => {
    
    let main: MainAPI;
    let orders: OrdersAPI;
    let ecosystem: Ecosystem;
    let authentication: Auth;
    let contracts: ContractsPage;

    test.beforeEach(async ({ page, request }) => {

        main = new MainAPI(page, request);
        orders = new OrdersAPI(page, request);
        ecosystem = new Ecosystem(page);
        authentication = new Auth(page);
        contracts = new ContractsPage(page);

        await ecosystem.saveAccessTokenSSO();
        await authentication.login();
        await ecosystem.changeLanguage();
        await contracts.openContractsPage();

    });

    test('Создание контракта', async() => {

        await main.createProject();
        await main.createHouse();
        await main.createProperty();
        await orders.getOrderByPropertyId();
        await orders.createContract();

    });

    test('Поиск контракта', async() => {

        await contracts.searchContract('AUTOTEST Контракт');
        const contractsTitleList = await contracts.getListFromPage('title');
        expect(contractsTitleList.length).toBeGreaterThan(0);
        expect(contractsTitleList.every(item => /AUTOTEST Контракт/i.test(item))).toBe(true);

    });

    test('Фильтрация контрактов по текущему пользователю', async() => {

        await contracts.filterByUser();
        const currentNameUser = await contracts.getNameCurrentUser();
        const contractsOwnerList = await contracts.getListFromPage('user');
        expect(contractsOwnerList.length).toBeGreaterThan(0);
        expect(contractsOwnerList.every(item => item.includes(currentNameUser))).toBe(true);

    });


    test('Сортировка контрактов по дате', async () => {

        let listTitleFromResponse: string[];
        let listTitleFromPage: string[];

        await test.step('Сортировка по дате изменения (сначала старые)', async () => {
            listTitleFromResponse = await contracts.sortByDate('updatedAtAsc');
            listTitleFromPage = await contracts.getListFromPage('title');
            expect(listTitleFromPage).toEqual(listTitleFromResponse);
        });
        await test.step('Сортировка по дате изменения (сначала новые)', async () => {
            listTitleFromResponse = await contracts.sortByDate('updatedAtDesc');
            listTitleFromPage = await contracts.getListFromPage('title');
            expect(listTitleFromPage).toEqual(listTitleFromResponse);
        });
        await test.step('Сортировка по дате создания (сначала старые)', async () => {
            listTitleFromResponse = await contracts.sortByDate('createdAtAsc');
            listTitleFromPage = await contracts.getListFromPage('title');
            expect(listTitleFromPage).toEqual(listTitleFromResponse);
        });
      
        await test.step('Сортировка по дате создания (сначала новые)', async () => {
            listTitleFromResponse = await contracts.sortByDate('updatedAtAsc');
            listTitleFromPage = await contracts.getListFromPage('title');
            expect(listTitleFromPage).toEqual(listTitleFromResponse);
        });
    });


    test('Удаление контракта', async({page}) => {

        await contracts.searchContract('AUTOTEST Контракт');
        await contracts.deleteContract();
        await contracts.searchContract('AUTOTEST Контракт')
        await expect(page.locator('pb-contract-card')).toHaveCount(0);

    });

    // test('Удаление объекта', async() => {
    // этого нет
    // });

});
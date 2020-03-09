import { launch, Browser, Page } from 'puppeteer';
import { WorkBookRow } from './DocumentXLSX';

export class Crawler {
    private browser!: Browser;
    private page!: Page;
    private _url: string = 'https://meuvivofixo.vivo.com.br/servlet/Satellite?c=Page&cid=1382552299185&pagename=MeuVivoFixo%2FPage%2FTemplateGlobalAreaAberta';

    get url(): string {
        return this._url;
    }

    set url(urlString: string) {
        this._url = urlString;
    }

    async create (): Promise<void> {
        this.browser = await launch({
            headless: false
        });
        this.page = await this.browser.newPage();
        this.page.setViewport({
            width: 800,
            height: 600
        });
    }

    async run (): Promise<void> {
        await this.page.goto(this._url);
    }

    async buttonConfirm (): Promise<void> {
        const selectorButtonConfirm = 'input.bt-prosseguir-00b';
        await this.page.waitForSelector(selectorButtonConfirm);
        await this.page.click(selectorButtonConfirm);
    }

    async fieldAddress (address: string): Promise<void> {
        const selectorFieldAddress = 'input[name=LOGRADOURO_ASSINANTE]';
        await this.page.waitForSelector(selectorFieldAddress);
        await this.page.$eval(selectorFieldAddress, (element, address) => element.value = address, address);
    }

    async fieldCity (city: string): Promise<void> {
        const selectorFieldCity = 'input[name=CIDADE_ASSINANTE]';
        await this.page.waitForSelector(selectorFieldCity);
        await this.page.$eval(selectorFieldCity, (element, city) => element.value = city, city);
    }

    async fieldAddressNumber (addressNumber: string): Promise<void> {
        const selectorFieldAddressNumber = 'input[name=NUM_LOGR_ASSINANTE]';
        await this.page.waitForSelector(selectorFieldAddressNumber);
        await this.page.$eval(selectorFieldAddressNumber, (element, addressNumber) => element.value = addressNumber, addressNumber);
    }

    async fieldAddressNumberUntil (addressNumber: string): Promise<void> {
        const selectorFieldAddressNumber = 'input[name=NUM_LOGR_ASSINANTE_ATE]';
        await this.page.waitForSelector(selectorFieldAddressNumber);
        await this.page.$eval(selectorFieldAddressNumber, (element, addressNumber) => element.value = addressNumber, addressNumber);
    }

    async buttonSearch (): Promise<void> {
        const selectorButtonSearch = '#btnPesquisar';
        await this.page.waitForSelector(selectorButtonSearch);
        await this.page.click(selectorButtonSearch);
    }

    async unvailableSystem (): Promise<void> {
        await this.page.waitForSelector('#popupAlerta1').then(() => {
            this.end();
            throw 'Sistema indisponível';
        }).catch((error: Error) => {
            console.log(error);
        });
    }

    async waitForResult (recursive: number = 0): Promise<void> {
        const selectorTableResult = '.tabelaResultado';
        await this.page.waitForSelector(selectorTableResult).catch(async (error: Error) => {
            if (recursive > 0) this.unvailableSystem();
            if (recursive > 3) throw error;

            console.log(error.name, error.message, recursive);
            await this.waitForResult(++recursive);
        });
    }

    async getTotalPages (): Promise<number> {
        const pagination = await this.page.$$('#formWCSVivo > table > tbody > tr:nth-child(16) > td > a');
        return pagination && pagination.length ? pagination.length : 1;
    }

    async getResult (): Promise<Array<WorkBookRow>> {
        const tbodys = await this.page.$$('#formWCSVivo > table > tbody > tr > td > table > tbody');
        const result = await Promise.all(tbodys.map(async tbody => {
            const [name, address, phone] = await this.page.evaluate(el => {
                function capitalize(s: string, all: Boolean = false): string {
                    return all ?
                        s.split(' ').map(word => capitalize(word)).join(' ') :
                        s.charAt(0).toUpperCase() + s.slice(1);
                }
                return [
                    capitalize(el.querySelector('tr:nth-child(1) > td:nth-child(1)').innerText.toLowerCase(), true),
                    el.querySelector('tr:nth-child(1) > td:nth-child(2)').innerText,
                    el.querySelector('tr:nth-child(2) > td:nth-child(1)').innerText,
                ];
            }, tbody);
            return {
                name, address, phone
            };
        }));
        return result;
    }
    
    async nextResultPage (page: number): Promise<void> {
        await this.page.click(`#formWCSVivo > table > tbody > tr:nth-child(16) > td > a:nth-child(${page})`).catch((error: Error) => {
            console.log(error);
        });
    }

    async end (): Promise<void> {
        await this.browser.close();
    }
}

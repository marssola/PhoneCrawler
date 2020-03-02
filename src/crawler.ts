import { launch, Browser, Page } from 'puppeteer';

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

    async end (): Promise<void> {
        await this.browser.close();
    }
}
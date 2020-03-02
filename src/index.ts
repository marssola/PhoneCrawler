import { Crawler } from './Crawler';
import { ContentRow, readXLSX, getFirstSheetName, getLastRow, getContentRow, createWorkbook, WorkBookRow, createXLSX } from './DocumentXLSX';
import { existsSync } from 'fs';
import { WorkBook, WorkSheet } from 'xlsx/types';

const listFile = 'lista.xlsx';

(async () => {
    const crawler = new Crawler();

    if (!existsSync(listFile)) throw new Error(`Arquivo ${listFile} não existe`);

    const listWorkbook: WorkBook = readXLSX(listFile);
    const sheetname = getFirstSheetName(listWorkbook);
    const workSheet: WorkSheet = listWorkbook.Sheets[sheetname];
    const lastRow = getLastRow(workSheet);
    
    await crawler.create();
    await crawler.run();

    for (let row = 2; row <= lastRow; ++row) {
        const [address, number, city]: Array<ContentRow> = (getContentRow(workSheet, row, ['A', 'B', 'C', 'D']));
        
        await crawler.buttonConfirm();
        await crawler.fieldAddress(address.v);
        await crawler.fieldCity(city.v);
        await crawler.fieldAddressNumber(number.v);
        await crawler.fieldAddressNumberUntil(number.v);
    
        await crawler.buttonSearch();
        await crawler.waitForResult();
        const pages = await crawler.getTotalPages();
    
        const phones: Array<WorkBookRow> = [];
        for (let page = 1; page <= pages; ++page) {
            if (page > 1) {
                await crawler.nextResultPage(page);
                await crawler.waitForResult();
            }
            const contentPages = await crawler.getResult();
            phones.push(...contentPages);
        }
        const workbook: WorkBook = createWorkbook(phones);
        createXLSX('test', workbook);

        await crawler.buttonSearch();
    }

    await crawler.end();
})();
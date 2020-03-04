import { Crawler } from './Crawler';
import { readXLSX, getFirstSheetName, getWorkSheetJSON, WorkSheetList, WorkBookRow, createWorkbook, createFileName, createXLSX, saveSheetJSON } from './DocumentXLSX';
import { existsSync } from 'fs';
import { WorkBook, WorkSheet } from 'xlsx/types';

const listFile = 'lista.xlsx';

(async () => {
    const crawler = new Crawler();

    if (!existsSync(listFile)) throw new Error(`Arquivo ${listFile} não existe`);

    const listWorkbook: WorkBook = readXLSX(listFile);
    const sheetname = getFirstSheetName(listWorkbook);
    const workSheet: WorkSheet = listWorkbook.Sheets[sheetname];
    const sheetJSON: Array<WorkSheetList> = getWorkSheetJSON(workSheet);
    
    await crawler.create();
    await crawler.run();
    await crawler.buttonConfirm();

    for (const it in sheetJSON) {
        const row = sheetJSON[it];
        const { Endereço: address, Número: number, Até: until, Cidade: city, Condominio: condominium, Status: status } = row;
        if (status && status === 'Ok') continue;

        if (!address || !number || !city) throw new Error('Endereço, Número ou Cidade são obrigatórios');
    
        await crawler.fieldAddress(address);
        await crawler.fieldCity(city);
        await crawler.fieldAddressNumber(number);
        await crawler.fieldAddressNumberUntil(until || number);
        
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
        const filename = createFileName({ address, number, until, condominium });
        createXLSX(filename, workbook);

        row.Status = 'Ok';
        saveSheetJSON(sheetJSON, listFile);
        console.log('\x1b[32m%s\x1b[0m', '[ Ok ]', `${address}, ${number}${until ? ` - ${until}`: ''}${condominium ? ` (${condominium})`: ''}`);

        await crawler.buttonSearch();
    }
    await crawler.end();
})();
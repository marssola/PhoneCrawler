import { Crawler } from './crawler';

(async () => {
    const crawler = new Crawler();

    await crawler.create();
    await crawler.run();

    await crawler.buttonConfirm();
    await crawler.fieldAddress('Rua São Manoel');
    await crawler.fieldCity('Diadema');
    await crawler.fieldAddressNumber('136');
    await crawler.fieldAddressNumberUntil('136');

    await crawler.buttonSearch();
    await crawler.waitForResult();
    const pages = await crawler.getTotalPages();

    const phones: Array<object> = [];
    for (let page = 1; page <= pages; ++page) {
        if (page > 1) {
            await crawler.nextResultPage(page);
            await crawler.waitForResult();
        }
        const contentPages = await crawler.getResult();
        phones.push(...contentPages);
    }

    await crawler.buttonSearch();

    // await crawler.end();
})();
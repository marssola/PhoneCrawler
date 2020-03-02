import { Crawler } from './crawler';

(async () => {
    const crawler = new Crawler();

    await crawler.create();
    await crawler.run();

    await crawler.buttonConfirm();
    await crawler.fieldAddress('Rua Adelino Tinti');
    await crawler.fieldCity('Diadema');
    await crawler.fieldAddressNumber('10');
    await crawler.fieldAddressNumberUntil('300');
    await crawler.buttonSearch();

    // await crawler.end();
})();
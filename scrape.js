const scrapeIt = require('scrape-it');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

const wait = (time) => new Promise(resolve => setTimeout(resolve, time));

const scrapeAmazonPage = (asin) => {
    const url = `https://www.amazon.nl/dp/${asin}`;
    console.log('Scraping URL', url);
    return scrapeIt(url, {
        price: {
            selector: '.apexPriceToPay>span',
            convert: p => parseFloat((p.split('€')[1]).replace(',','.'))
        }
    });
}

const updatePrice = (itemId, price) => {
    console.log(`Inserting item:`, itemId, price);
    db.run(`INSERT INTO itemprices (itemsId, price) VALUES ('${itemId}', '${price}');`, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

const scrape = async () => {
    db.all('SELECT * FROM items', [], async (err, items) => {
        for (const item of items) {
            const scraped = await scrapeAmazonPage(item.asin);
            if (scraped.response.statusCode === 200 && scraped.data.price) {
                updatePrice(item.id, scraped.data.price);
            } else {
                console.log('Out of stock');
            }
            await wait(2000);
        }
    });
}
scrape();
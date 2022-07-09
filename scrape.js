// packages
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

//  Protecting Twilio Virtual number and My verified number in a env variable
const virtualNo = process.env.TWILIO_VIRTUAL_NO;
const myNo = process.env.TWILIO_VERIFIED_NO;

// Twilio auth
const client = require('twilio')(accountSid, authToken);
// Product url stored in a ENV Variable
const url = process.env.MY_PRODUCT_URL;

const product = { name: '', price: "", link: "" }

// SetInterval
const handle = setInterval(scrape, 10000);

async function scrape() {
    // fetch
    const { data } = await axios.get(url);
    // load HTML
    const $ = cheerio.load(data);
    const item = $('div#dp')
    // extract the data we require(;particularly name/title of the product)
    product.name = $(item).find('h1 span#productTitle').text();
    product.link = url;
    const price = $(item).find('span .a-price-whole').first().text().replace(/[,.]/g, '');
    // converting price from string datatype to integer
    const priceInt = parseInt(price);
    // assigning integer price to our product object's key price
    product.price = priceInt;
    // console.log(product)
    /*----------------------------------------------------------------------------------------------------------*/
    // sending SMS Using Twilio

    if (priceInt < 1000) {
        client.messages.create({
            body: `The Price of${product.name} went below ${price}. Purchase it ASAP! now @ ${product.link}`,
            from: virtualNo,
            to: myNo

        }).then(message => {
            console.log(message);
            clearInterval(handle);
        })
    }

}


scrape();
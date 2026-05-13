const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend updates
const supabase = createClient(supabaseUrl, supabaseKey);

async function crawlPrices(items) {
  const browser = await puppeteer.launch({ 
    headless: "new",
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  // Set viewport to desktop to ensure all elements load
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];

  for (let item of items) {
    // 1. Initial Cleaning & Typo Correction
    let cleanItem = item.split(/[-/]/)[0]
      .replace(/[0-9]/g, '')
      .replace(/\(.*\)/g, '')
      .replace(/tirim/gi, 'tiram') // Fix specific typo "saus tirim" -> "saus tiram"
      .trim();
    
    if (cleanItem.length < 3) continue;

    console.log(`Searching for: "${item}" as "${cleanItem}"`);
    
    // Function to try search with reducing keywords if no results found
    const trySearchWithReduction = async (searchFunc) => {
      let keywords = cleanItem.split(/\s+/);
      while (keywords.length > 0) {
        const currentSearch = keywords.join(' ');
        const result = await searchFunc(currentSearch);
        if (result) return result;
        if (keywords.length === 1) break;
        keywords.pop(); // Reduce by removing last word
        console.log(`  - No result for "${currentSearch}", trying: "${keywords.join(' ')}"`);
      }
      return null;
    };

    // 1. Alfagift (uses '-' for spaces)
    console.log(`  [Alfagift] Checking...`);
    const alfaPriceResult = await trySearchWithReduction(async (query) => {
      try {
        const url = `https://alfagift.id/find/${encodeURIComponent(query).replace(/%20/g, '-')}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const price = await page.evaluate(() => {
          // Check if product is available (look for "Tidak Tersedia" or similar)
          const stockInfo = document.body.innerText.toLowerCase();
          if (stockInfo.includes('tidak tersedia') || stockInfo.includes('stok habis')) {
            return null;
          }

          const selectors = ['.product-price', 'span.price', 'div.price-container span'];
          for (let s of selectors) {
            const el = document.querySelector(s);
            if (el && el.innerText.includes('Rp')) return el.innerText;
          }
          return null;
        });
        if (price) console.log(`    - Found: ${price} for "${query}"`);
        return price;
      } catch (e) { return null; }
    });

    if (alfaPriceResult) {
      const price = parseInt(alfaPriceResult.replace(/[^0-9]/g, ''));
      if (price > 0) results.push({ item_name: item, price, store_name: 'Alfagift' });
    }

    // 2. KlikIndomaret (uses '%20' for spaces)
    console.log(`  [KlikIndomaret] Checking...`);
    const indoPriceResult = await trySearchWithReduction(async (query) => {
      try {
        const url = `https://www.klikindomaret.com/search?keyword=${encodeURIComponent(query)}`;
        // Indomaret is heavy, wait for more network stability
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
        
        // Give it a moment to render JS components
        await new Promise(r => setTimeout(r, 2000));

        return await page.evaluate(() => {
          // 1. Try common price classes
          const selectors = [
            '.price', 
            '.normal-price', 
            '.product-price',
            '#default-card .price',
            'div[class*="price"]'
          ];
          for (let s of selectors) {
            const elements = document.querySelectorAll(s);
            for (let el of elements) {
              if (el && el.innerText.includes('Rp')) return el.innerText;
            }
          }
          
          // 2. Try specific XPath provided by user
          const result = document.evaluate('/html/body/div/div/div/div[4]/form/div/div/div[2]/div/div/div[2]/div/div/div/a/div/div/div', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          if (result.singleNodeValue && result.singleNodeValue.innerText.includes('Rp')) {
            return result.singleNodeValue.innerText;
          }

          // 3. Fallback: Search for any text matching Rp format in the whole body
          const match = document.body.innerText.match(/Rp\s*[0-9]+(\.[0-9]+)*/);
          return match ? match[0] : null;
        });
      } catch (e) { return null; }
    });

    if (indoPriceResult) {
      const price = parseInt(indoPriceResult.replace(/[^0-9]/g, ''));
      if (price > 0) results.push({ item_name: item, price, store_name: 'KlikIndomaret' });
    }

    // 3. Yogya Online (uses '+' for spaces) - Skip or handle login block
    console.log(`  [Yogya Online] Checking (Skipping if login required)...`);
    const yogyaPriceResult = await trySearchWithReduction(async (query) => {
      try {
        const url = `https://supermarket.yogyaonline.co.id/?search=${encodeURIComponent(query).replace(/%20/g, '+')}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Check for login block or modal
        const isBlocked = await page.evaluate(() => {
          return document.body.innerText.toLowerCase().includes('login') || 
                 !!document.querySelector('.login-container') ||
                 !!document.querySelector('#login-modal');
        });

        if (isBlocked) {
          console.log(`    - Yogya Online: Blocked by login.`);
          return null;
        }

        const price = await page.evaluate(() => {
          const selectors = ['.price-box', '.price', '.product-price'];
          for (let s of selectors) {
            const el = document.querySelector(s);
            if (el && el.innerText.includes('Rp')) return el.innerText;
          }
          return null;
        });
        if (price) console.log(`    - Found: ${price} for "${query}"`);
        return price;
      } catch (e) { return null; }
    });

    if (yogyaPriceResult) {
      const price = parseInt(yogyaPriceResult.replace(/[^0-9]/g, ''));
      if (price > 0) results.push({ item_name: item, price, store_name: 'Yogya Online' });
    }
  }

  await browser.close();

  // Save to Supabase
  if (results.length > 0) {
    const { error } = await supabase
      .from('product_prices')
      .upsert(results, { onConflict: 'item_name,store_name' });
    
    if (error) console.error('Error saving to Supabase:', error);
    else console.log(`Successfully updated ${results.length} prices.`);
  }

  return results;
}

// Run the crawler if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const runCrawler = async () => {
    let itemsToSearch = [];
    
    if (args.length > 0) {
      itemsToSearch = args;
    } else {
      console.log('Fetching items from Supabase meal_groceries table...');
      const { data, error } = await supabase
        .from('meal_groceries')
        .select('items');
      
      if (error) {
        console.error('Error fetching items:', error.message);
        itemsToSearch = ['Beras 5kg', 'Minyak Goreng 2L', 'Telur Ayam']; // Fallback
      } else if (data && data.length > 0) {
        // Flatten all items from all categories and remove duplicates
        const allItems = data.flatMap(row => row.items || []);
        // Clean item names: "Bawang Merah (4 siung)" -> "Bawang Merah"
        const uniqueItems = [...new Set(allItems.map(item => item.split('(')[0].trim()))];
        itemsToSearch = uniqueItems;
        console.log(`Found ${itemsToSearch.length} unique items in database.`);
      } else {
        console.log('No items found in database, using defaults.');
        itemsToSearch = ['Beras 5kg', 'Minyak Goreng 2L', 'Telur Ayam'];
      }
    }
    
    if (itemsToSearch.length === 0) {
      console.log('No items to search. Exiting.');
      return;
    }

    console.log('Starting crawler for items:', itemsToSearch);
    await crawlPrices(itemsToSearch);
    console.log('Crawler finished.');
  };

  runCrawler().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Crawler failed:', err);
    process.exit(1);
  });
}

module.exports = { crawlPrices };

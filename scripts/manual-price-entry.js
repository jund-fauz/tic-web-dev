const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend updates
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncGroceryItems() {
  console.log('Fetching items from Supabase meal_groceries table...');
  const { data, error } = await supabase
    .from('meal_groceries')
    .select('items');
  
  if (error) {
    console.error('Error fetching items:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No items found in meal_groceries.');
    process.exit(0);
  }

  // Flatten all items from all categories and remove duplicates
  const allItems = data.flatMap(row => row.items || []);
  // Clean item names: "Bawang Merah (4 siung)" -> "Bawang Merah"
  const uniqueItems = [...new Set(allItems.map(item => item.split('(')[0].trim()))].sort();

  console.log(`Found ${uniqueItems.length} unique items in groceries.`);

  const store_name = 'Manual';
  
  // Fetch existing items for 'Manual' store to avoid overwriting existing prices
  const { data: existingPrices, error: fetchError } = await supabase
    .from('product_prices')
    .select('item_name')
    .eq('store_name', store_name);

  if (fetchError) {
    console.error('Error fetching existing prices:', fetchError);
    process.exit(1);
  }

  const existingItemNames = new Set(existingPrices.map(p => p.item_name));
  
  // Filter for items that don't exist yet
  const newItems = uniqueItems
    .filter(item => !existingItemNames.has(item))
    .map(item => ({
      item_name: item,
      price: 0,
      store_name: store_name,
      updated_at: new Date().toISOString()
    }));

  if (newItems.length > 0) {
    console.log(`Adding ${newItems.length} new items to product_prices with default price 0...`);
    
    const { error: insertError } = await supabase
      .from('product_prices')
      .insert(newItems);
    
    if (insertError) {
      console.error('Error inserting new items:', insertError);
    } else {
      console.log('Successfully synced new items. You can now edit prices in the Supabase dashboard.');
      newItems.forEach(item => console.log(`  + ${item.item_name}`));
    }
  } else {
    console.log('No new items to sync. All grocery items already exist in product_prices.');
  }
}

syncGroceryItems().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});

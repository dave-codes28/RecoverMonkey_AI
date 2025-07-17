
import 'dotenv/config';
import supabaseAdmin from '../lib/supabaseAdmin';

async function updateCartItemsAddImageUrl() {
  console.log('Starting migration: Add image_url to each cart item if missing...');

  // Fetch all carts
  const { data: carts, error } = await supabaseAdmin.from('carts').select('id, items');
  if (error) {
    console.error('Error fetching carts:', error);
    return;
  }
  if (!carts || carts.length === 0) {
    console.log('No carts found.');
    return;
  }

  let updatedCount = 0;
  for (const cart of carts) {
    if (!Array.isArray(cart.items)) continue;
    let changed = false;
    const newItems = cart.items.map((item: any) => {
      if (item.image_url === undefined) {
        changed = true;
        return { ...item, image_url: '' };
      }
      return item;
    });
    if (changed) {
      const { error: updateError } = await supabaseAdmin
        .from('carts')
        .update({ items: newItems })
        .eq('id', cart.id);
      if (updateError) {
        console.error(`Error updating cart ${cart.id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`Updated cart ${cart.id}`);
      }
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} carts.`);
}

updateCartItemsAddImageUrl(); 
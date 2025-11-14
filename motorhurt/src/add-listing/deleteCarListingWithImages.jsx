import { deleteObject, getStorage, ref } from 'firebase/storage';
import { db } from './../../configs';
import { CarImages, CarListing } from './../../configs/schema';
import { eq } from 'drizzle-orm';
import { storage } from '#configs/firebaseConfig';


export const deleteCarListingWithImages = async (carId) => {
  try {
    // 1. Get all image URLs from DB
    const images = await db.select().from(CarImages).where(eq(CarImages.carListingId, carId));

    // 2. Delete each image from Firebase Storage
    for (const image of images) {
      const imageUrl = image.imageUrl;
      if (!imageUrl) continue;

      // Extract path from URL
      const path = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
      const imageRef = ref(storage, path);

      try {
        await deleteObject(imageRef);
        console.log('Deleted image from Firebase:', path);
      } catch (error) {
        console.warn('Failed to delete image from Firebase:', path, error);
      }
    }

    // 3. Delete image records from DB
    await db.delete(CarImages).where(eq(CarImages.carListingId, carId));

    // 4. Delete car listing
    await db.delete(CarListing).where(eq(CarListing.id, carId));

    console.log('Successfully deleted car and all associated images.');
    return true;
  } catch (err) {
    console.error('Error deleting listing and images:', err);
    return false;
  }
};

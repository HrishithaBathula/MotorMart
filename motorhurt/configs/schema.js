
import { integer, json, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const CarListing=pgTable('carLisiting',{
    id:serial('id').primaryKey(),
    listingTitle:varchar('listingTitle'),
    tagline:varchar('tagline'),
    originalPrice:varchar('originalPrice'),
    sellingPrice:varchar('sellingPrice').notNull(),
    category:varchar('category').notNull(),
    condition:varchar('condition').notNull(),
    make:varchar('make').notNull(),
    model:varchar('model').notNull(),
    year:varchar('year').notNull(),
    driveType:varchar('driveType').notNull(),
    transmission:varchar('transmission').notNull(),
    fuelType:varchar('fuelType').notNull(),
    mileage:varchar('mileage').notNull(),
    engineSize:varchar('engineSize'),
    cylinder:varchar('cylinder'),
    color:varchar('color').notNull(),
    door:varchar('door').notNull(),
    offerType:varchar('offerType'),
    vin:varchar('vin'),
    listingDescription:varchar('listingDescription').notNull(),
    features:json('features'),
    createdBy:varchar('createdBy').notNull(),
    userName:varchar('userName').notNull().default('rakesh'),
    userImageUrl:varchar('userImageUrl').default('https://images.playground.com/11485428-fe20-4d6c-a1c4-dcfd1bf3ff14.jpeg'),
    postedOn:varchar('postedOn')
})

export const CarImages=pgTable('carImages',{
    id:serial('id').primaryKey(),
    imageUrl:varchar('imageUrl').notNull(),
    carListingId:integer('carListingId').notNull().references(()=>CarListing.id)
})
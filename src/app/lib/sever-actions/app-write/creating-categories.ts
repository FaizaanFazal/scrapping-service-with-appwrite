'use server'
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../../app-write/appwrite-admin";


export const AllCategoriesCreation = async (major_name: string, major_description: string, categories: string[],
    minor_name: string, minor_description: string,
    sub_name: string, sub_description: string,
) => {
    const majorcategoryId = await createOrUpdateMajorCategory(major_name, major_description, [])
    if (!majorcategoryId) {
        console.log("major categoryId not found")
        return
    }
    const minorCategoryId = await createOrUpdateMinorCategory(majorcategoryId, minor_name, minor_description, [])
    if (!minorCategoryId) {
        console.log("minor categoryId not found")
        return
    }
    const updateMinorinMajor = await updateMinorCategoryIdsInMajorCategory(majorcategoryId, minorCategoryId)
    if (updateMinorinMajor) { console.log("updated minorid in major success") }

    const subCategoryId = await createOrUpdateSubCategory(minorCategoryId, sub_name, sub_description, null)
    console.log("subCategoryId", subCategoryId)
    if (!subCategoryId) {
        console.log("subcategory categoryId not found")
        return
    }   
    const updateSubinMinor = await updateSubCategoryIdsInMinorCategory(minorCategoryId, subCategoryId)
    if (updateSubinMinor) { console.log("updated subcategory in minor success") }
    return "successfully created all categories"
}
// major
export const createOrUpdateMajorCategory = async (name: string, description: string, categories: string[]) => {
  const adminClient = await createAdminClient();

  try {
    // Step 1: Check if a major category with the same name exists
    const existingMajorCategories = await adminClient.databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d84248001d6e682bf0',  // Collection ID for major categories
      [Query.equal('name', name)]  // Query to check for existing name
    );

    if (existingMajorCategories.total > 0) {
      // Step 2: If a category with the same name exists, update it
      const existingCategory = existingMajorCategories.documents[0];
      const updatedCategory = await adminClient.databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d84248001d6e682bf0',  // Collection ID for major categories
        existingCategory.$id,  // ID of the existing document
        {
          description,
          categories // Update description and categories
        }
      );
      console.log('Updated Major Category:', updatedCategory);
      return updatedCategory.$id;
    } else {
      // Step 3: If no category with the same name exists, create a new one
      const majorCategoryDocument = {
        category_id: ID.unique(),
        name,
        description,
        categories // Array of minor category IDs
      };

      const majorCategory = await adminClient.databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d84248001d6e682bf0',  // Collection ID for major categories
        ID.unique(),  // Use ID.unique() to avoid conflict
        majorCategoryDocument
      );
      console.log('Created Major Category:', majorCategory);
      return majorCategory.$id;
    }
  } catch (error) {
    console.error('Error creating or updating Major Category:', error);
  }
};

// minor
export const createOrUpdateMinorCategory = async (categoryId: string, categoryName: string, description: string, newSubCategories: string[]) => {
  const adminClient = await createAdminClient();

  try {
    // Step 1: Check if a minor category with the same name exists
    const existingMinorCategories = await adminClient.databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d6edc100209d232a08',  // Collection ID for minor categories
      [Query.equal('category_name', categoryName)]  // Query to check for existing name
    );

    if (existingMinorCategories.total > 0) {
      // Step 2: If a category with the same name exists, update it
      const existingCategory = existingMinorCategories.documents[0];
      
      // Retrieve existing sub-categories
      let existingSubCategories = existingCategory.sub_categories || [];

      // Step 3: Merge the existing and new subcategories while keeping them unique
      const mergedSubCategories = [...new Set([...existingSubCategories, ...newSubCategories])];  // Merge and remove duplicates

      // Update the category with the merged sub-categories
      const updatedCategory = await adminClient.databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d6edc100209d232a08',  // Collection ID for minor categories
        existingCategory.$id,  // ID of the existing document
        {
          description,  // Update the description
          sub_categories: mergedSubCategories  // Update with merged sub-categories
        }
      );
      console.log('Updated Minor Category:', updatedCategory);
      return updatedCategory.$id;
    } else {
      // Step 4: If no category with the same name exists, create a new one
      const minorCategoryDocument = {
        category_id: categoryId,  // Parent major category ID (as a field inside the document)
        category_name: categoryName,
        description,
        sub_categories: newSubCategories  // Array of new sub-category IDs
      };

      // Use ID.unique() to generate a unique document ID
      const minorCategory = await adminClient.databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d6edc100209d232a08',  // Collection ID for minor categories
        ID.unique(),  // Use ID.unique() to avoid conflict
        minorCategoryDocument
      );
      console.log('Created Minor Category:', minorCategory);
      return minorCategory.$id;
    }
  } catch (error) {
    console.error('Error creating or updating Minor Category:', error);
  }
};


// sub category
export const createOrUpdateSubCategory = async (minorCategoryId: string, subCategoryName: string, description: string, datasetId: string | null = null) => {
  const adminClient = await createAdminClient();

  try {
    // Step 1: Check if a subcategory with the same name exists
    const existingSubCategories = await adminClient.databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d6ee3700099dc89393',  // Collection ID for subcategories
      [Query.equal('sub_category_name', subCategoryName)]  // Query to check for existing name
    );

    if (existingSubCategories.total > 0) {
      // Step 2: If a subcategory with the same name exists, update it
      const existingSubCategory = existingSubCategories.documents[0];
      const updatedSubCategory = await adminClient.databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d6ee3700099dc89393',  // Collection ID for subcategories
        existingSubCategory.$id,  // ID of the existing document
        {
          description,
          dataset_Id: datasetId  // Update description and dataset_Id
        }
      );
      console.log('Updated Sub Category:', updatedSubCategory);
      return updatedSubCategory.$id;
    } else {
      // Step 3: If no subcategory with the same name exists, create a new one
      const subCategoryDocument = {
        sub_category_id: ID.unique(),
        category_id: minorCategoryId,  // Parent minor category ID
        sub_category_name: subCategoryName,
        description,
        dataset_Id: datasetId  // Initially, this can be null if the dataset is not yet created
      };

      const subCategory = await adminClient.databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d6ee3700099dc89393',  // Collection ID for subcategories
        ID.unique(),  // Use ID.unique() to avoid conflict
        subCategoryDocument
      );
      console.log('Created Sub Category:', subCategory);
      return subCategory.$id;
    }
  } catch (error) {
    console.error('Error creating or updating Sub Category:', error);
  }
};


export const updateSubCategoryWithDataset = async (subCategoryId: string, datasetId: string) => {
    const adminClient = await createAdminClient();
    try {
        const updatedSubCategory = await adminClient.databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID || '',
            '66d6ee3700099dc89393',  // Collection ID for subcategories
            subCategoryId,  // Sub-category to be updated
            { dataset_Id: datasetId }  // Update with the new dataset ID
        );
        console.log(`Updated Sub Category with dataset ID ${datasetId}:`, updatedSubCategory);
    } catch (error) {
        console.error(`Error updating Sub Category with dataset ID ${datasetId}:`, error);
    }
};


const updateMinorCategoryIdsInMajorCategory = async (majorCategoryId: string, minorCategoryId: string) => {
    const adminClient = await createAdminClient();
    try {
        const majorCategory = await adminClient.databases.getDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID || '',
            '66d84248001d6e682bf0',  // Collection ID for major categories
            majorCategoryId  //id to update
        );
        let categories = majorCategory.categories || [];
        if (!categories.includes(minorCategoryId)) { //ensure no duplciate
            categories.push(minorCategoryId);
        }
        const updatedMajorCategory = await adminClient.databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID || '',
            '66d84248001d6e682bf0',  // Collection ID for major categories
            majorCategoryId,  // The major category to update
            { categories }  // Update the categories field
        );

        console.log(`Updated Major Category with new Minor Category ID: ${minorCategoryId}`);
        return updatedMajorCategory;
    } catch (error) {
        console.error(`Error updating Major Category with Minor Category ID: ${minorCategoryId}`, error);
    }
};

const updateSubCategoryIdsInMinorCategory = async (minorCategoryId: string, subCategoryId: string) => {
    const adminClient = await createAdminClient();

    try {
        // Fetch the existing minor category document
        const minorCategory = await adminClient.databases.getDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID || '',
            '66d6edc100209d232a08',  // Collection ID for minor categories
            minorCategoryId  // The minor category to update
        );

        // Parse the current sub-categories array, if it exists, or initialize it
        let subCategories = minorCategory.sub_categories || [];

        // Add the new subcategory ID to the array, ensuring no duplicates
        if (!subCategories.includes(subCategoryId)) {
            subCategories.push(subCategoryId);
        }

        // Update the minor category with the new sub-categories array
        const updatedMinorCategory = await adminClient.databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID || '',
            '66d6edc100209d232a08',  // Collection ID for minor categories
            minorCategoryId,  // The minor category to update
            { sub_categories: subCategories }  // Update the sub-categories field
        );

        console.log(`Updated Minor Category with new Subcategory ID: ${subCategoryId}`);
        return updatedMinorCategory;
    } catch (error) {
        console.error(`Error updating Minor Category with Subcategory ID: ${subCategoryId}`, error);
    }
};


export const listMajorCategories = async () => {
  const adminClient = await createAdminClient();
  
  try {
    const subCategories = await adminClient.databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d84248001d6e682bf0'  // Collection ID for subcategories
    );
    console.log('Subcategories:', subCategories.documents);
  } catch (error) {
    console.error('Error listing subcategories:', error);
  }
};

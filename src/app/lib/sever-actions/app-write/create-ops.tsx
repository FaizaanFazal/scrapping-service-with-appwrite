import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../../app-write/appwrite-admin";
import path from 'path';
import { promises as fs } from 'fs';
import JSONStream from 'JSONStream';
import { createReadStream } from 'fs';

const createCategory = async () => {
  try {
    const adminClient = await createAdminClient();
    const categoryDocument = {
      category_id: ID.unique(),
      category_name: 'Contracts, Spending, and Operations',
      description: 'Contracts over $10,000, standing offer agreements, supply arrangements',
    };

    const category = await adminClient.databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d6edc100209d232a08',
      'unique()',
      categoryDocument
    );

    console.log('Category created:', category);
    return category.$id; // Return category ID to link subcategory
  } catch (error) {
    console.error('Error creating category:', error);
  }
};

const createSubcategory = async (categoryId: string) => {
  try {
    const adminClient = await createAdminClient();
    const subcategoryDocument = {
      sub_category_id: ID.unique(),
      category_id: categoryId,
      sub_category_name: 'Contracts over $10,000',
      description: 'Contracts over $10,000, standing offer agreements, supply arrangements',
    };

    const subcategory = await adminClient.databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d6ee3700099dc89393',
      'unique()',
      subcategoryDocument
    );

    console.log('Subcategory created:', subcategory);
    return subcategory.$id; // Return subcategory ID to link dataset
  } catch (error) {
    console.error('Error creating subcategory:', error);
  }
};


const createOrUpdateDataset = async (subcategoryId: string) => {
  try {
    const adminClient = await createAdminClient();

    const datasetName = 'Contracts over $10,000'; // Name of the dataset
    const datasetQuery = [Query.equal('dataset_name', datasetName)]; // Query for matching dataset name

    // Step 1: Check if a dataset with the same name exists
    const existingDatasets = await adminClient.databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d7dd4400048f8fbd2f', // The ID of your Datasets collection
      datasetQuery
    );

    // Step 2: Prepare the dataset document (whether creating or updating)
    const datasetDocument = {
      dataset_id: ID.unique(),
      sub_category_id: subcategoryId,
      dataset_name: datasetName,
      columns: JSON.stringify([
        { id: 'reference_number', type: 'text' },
        { id: 'procurement_id', type: 'text' },
        { id: 'vendor_name', type: 'text' },
        { id: 'vendor_postal_code', type: 'text' },
        { id: 'buyer_name', type: 'text' },
        { id: 'contract_date', type: 'text' },
        { id: 'economic_object_code', type: 'text' },
        { id: 'description_en', type: 'text' },
        { id: 'description_fr', type: 'text' },
        { id: 'contract_period_start', type: 'text' },
        { id: 'delivery_date', type: 'text' },
        { id: 'contract_value', type: 'text' },
        { id: 'original_value', type: 'text' },
        { id: 'amendment_value', type: 'text' },
        { id: 'comments_en', type: 'text' },
        { id: 'comments_fr', type: 'text' },
        { id: 'additional_comments_en', type: 'text' },
        { id: 'additional_comments_fr', type: 'text' },
        { id: 'agreement_type_code', type: 'text' },
        { id: 'trade_agreement', type: 'text' },
        { id: 'land_claims', type: 'text' },
        { id: 'commodity_type', type: 'text' },
        { id: 'commodity_code', type: 'text' },
        { id: 'country_of_vendor', type: 'text' },
        { id: 'solicitation_procedure', type: 'text' },
        { id: 'limited_tendering_reason', type: 'text' },
        { id: 'trade_agreement_exceptions', type: 'text' },
        { id: 'indigenous_business', type: 'text' },
        { id: 'indigenous_business_excluding_psib', type: 'text' },
        { id: 'intellectual_property', type: 'text' },
        { id: 'potential_commercial_exploitation', type: 'text' },
        { id: 'former_public_servant', type: 'text' },
        { id: 'contracting_entity', type: 'text' },
        { id: 'standing_offer_number', type: 'text' },
        { id: 'instrument_type', type: 'text' },
        { id: 'ministers_office', type: 'text' },
        { id: 'number_of_bids', type: 'text' },
        { id: 'article_6_exceptions', type: 'text' },
        { id: 'award_criteria', type: 'text' },
        { id: 'socioeconomic_indicator', type: 'text' },
        { id: 'reporting_period', type: 'text' },
        { id: 'owner_org', type: 'text' },
        { id: 'owner_org_title', type: 'text' }
      ]),
      data: JSON.stringify([
        ["C-2019-2020-Q4-1", "P2000002", "Updated Simzer Design Inc.", null, null, "2020-02-26", "0351", "Communications professional services not elsewhere specified", "Services professionnels de communications non specifies ailleurs", "2019-11-15", "2020-05-30", "38900.25", "15255.0", "23645.25", "Increase contract by $23,645", "Augmentation du contrat de 23 645 $", null, null, "0", null, null, "S", "T005", "CA", "TN", "85", "00", null, "N", "A3", "N", "N", null, null, "A", "N", null, null, null, null, "2019-2020-Q4", "casdo-ocena", "Accessibility Standards Canada | Normes d’accessibilité Canada"],
        ["C-2019-2020-Q4-2", "P2000004", "Breckenhill Inc.", null, null, "2020-02-26", "0499", "Other professional services not elsewhere specified", "Autres services professionnels non specifies ailleurs", "2019-12-20", "2020-06-30", "39832.51", "24789.38", "15043.13", "Increase contract by $15,043", "Augmentation du contrat de 15 043 $", null, null, "0", null, null, "S", "R019", "CA", "TN", "85", "00", null, "N", "A3", "N", "Y", null, null, "A", "N", null, null, null, null, "2019-2020-Q4", "casdo-ocena", "Accessibility Standards Canada | Normes d’accessibilité Canada"]
      ])
    };

    // Step 3: If the dataset exists, update it
    if (existingDatasets.total > 0) {
      const existingDatasetId = existingDatasets.documents[0].$id;
      const updatedDataset = await adminClient.databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d7dd4400048f8fbd2f',  // The ID of your Datasets collection
        existingDatasetId,  // ID of the existing document
        datasetDocument
      );
      console.log(`Updated dataset with ID ${existingDatasetId}:`, updatedDataset);
      return existingDatasets.documents[0].$id;
    } else {
      // Step 4: If the dataset does not exist, create a new one
      const newDataset = await adminClient.databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',
        '66d7dd4400048f8fbd2f',  // The ID of your Datasets collection
        'unique()',  // Auto-generate a unique ID
        datasetDocument
      );
      console.log('Created new dataset:', newDataset);
      return newDataset.$id
    }
  } catch (error) {
    console.error('Error creating or updating dataset:', error);
  }
};



export const createFullDataset = async (filePath: string) => {
  const categoryId = await createCategory();
  if(!categoryId){
      console.log("categoryId not found")
      return 
  }
  const subcategoryId = await createSubcategory(categoryId);
  if(!subcategoryId){
      console.log("subcategoryId not found")
      return 
  }
  const documentId = await createOrUpdateDataset(subcategoryId);
  console.log('documentId',documentId)
  if(!documentId){
    console.log('Document id not found',documentId)
    return
  }
  processDatasetUpdate(documentId, filePath);
};

const processDatasetUpdate = async (documentId: string, jsonFilePath: string) => {
  try {
    if (documentId) {
      await processLargeJsonFileAndUpdate(jsonFilePath, documentId);
    }
  } catch (error) {
    console.error('Error processing dataset update:', error);
  }
};


const processLargeJsonFileAndUpdate = async (filePath: string, documentId: string) => {
  try {
    const stream = createReadStream(filePath, { encoding: 'utf-8' });
    const parser = JSONStream.parse('records.*');  
    let batch: any[] = [];
    let count=0;
    const BATCH_SIZE = 1000;
    stream.pipe(parser);
    parser.on('data', (record) => {
      batch.push(record);
      if (batch.length >= BATCH_SIZE) {
        updateDatasetRecords(documentId, batch); 
        batch = [];  // Reset batch
        count=count+1000
        console.log("update ",count)
      }
      
    });
    parser.on('end', async () => {
      if (batch.length > 0) {
        await updateDatasetRecords(documentId, batch);  
      }
      console.log('Finished processing large JSON file');
    });

    parser.on('error', (error) => {
      console.error('Error parsing JSON:', error);
    });
  } catch (error) {
    console.error('Error reading or processing the file:', error);
  }
};

const updateDatasetRecords = async (documentId: string, newRecords: any[]) => {
  try {
    const adminClient = await createAdminClient();

    // Step 1: Retrieve the existing document
    const existingDocument = await adminClient.databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d7dd4400048f8fbd2f',  // Your Datasets collection ID
      documentId
    );

    // Step 2: Parse the existing data
    let existingData = JSON.parse(existingDocument.data);

    // Step 3: Directly append the new records to the existing data
    existingData = [...existingData, ...newRecords];  // Append new records without checking

    // Step 4: Update the document with the appended data
    await adminClient.databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',
      '66d7dd4400048f8fbd2f',  // Your Datasets collection ID
      documentId,
      { data: JSON.stringify(existingData) }  // Update the data field with the merged data
    );

    console.log(`Successfully updated dataset with ID ${documentId}`);
  } catch (error) {
    console.error(`Error updating dataset with ID ${documentId}:`, error);
  }
};


// const updateDatasetRecords = async (documentId: string, newRecords: any[]) => {
//   try {
//     const adminClient = await createAdminClient();
//     const existingDocument = await adminClient.databases.getDocument(
//       process.env.NEXT_PUBLIC_DATABASE_ID || '',
//       '66d7dd4400048f8fbd2f',  // Your Datasets collection ID
//       documentId
//     );

//     let existingData = JSON.parse(existingDocument.data);
//     newRecords.forEach((newRecord) => {
//       const recordIndex = existingData.findIndex(
//         (record: string[]) => record[1] === newRecord[1] 
//       );
//       if (recordIndex !== -1) {
//         existingData[recordIndex] = newRecord;
//       } else {
//         existingData.push(newRecord);
//       }
//     });

//     // Step 4: Update the document with the new data
//     await adminClient.databases.updateDocument(
//       process.env.NEXT_PUBLIC_DATABASE_ID || '',
//       '66d7dd4400048f8fbd2f',  // Your Datasets collection ID
//       documentId,
//       { data: JSON.stringify(existingData) }  // Update the data field with the merged data
//     );

//     console.log(`Successfully updated dataset with ID ${documentId}`);
//   } catch (error) {
//     console.error(`Error updating dataset with ID ${documentId}:`, error);
//   }
// };


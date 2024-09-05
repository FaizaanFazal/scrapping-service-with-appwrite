'use server'
import path from 'path';
import JSONStream from 'JSONStream';
import { Client, Databases } from 'node-appwrite';
import { createReadStream } from 'fs';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
console.warn = () => {}; 

const adminClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT || '') 
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID || '')
  .setKey(process.env.NEXT_PUBLIC_API_KEY || '');

const databases = new Databases(adminClient);
let lastDatasetId: string | null = null;
const BATCH_SIZE = 1000;  // Set the batch size to 1000

const processJsonFileInBatches = async (filePath: string, subCategoryId: string) => {
  const stream = createReadStream(filePath, { encoding: 'utf-8' });
  const parser = JSONStream.parse('records.*');  
  let batch: any[] = [];
  let count=0;
  stream.pipe(parser);
  parser.on('data', async (record) => {
    batch.push(record);

    if (batch.length >= BATCH_SIZE) {
      await insertBatchIntoContractsDataset(batch);
      batch = [];  // Reset the batch after insertion
      count=count+1000
      console.log("batch added",count)
    }
  });

  // Handle the end of the file (remaining records)
  parser.on('end', async () => {
    if (batch.length > 0) {
      await insertBatchIntoContractsDataset(batch);  // Insert remaining batch
    }

    console.log('Finished processing JSON file.');

    // Update subcategory with dataset_id
    if(lastDatasetId){
      console.log("dataset id being added to subcategories",lastDatasetId)
      await updateSubcategoryWithDatasetId(subCategoryId,lastDatasetId);
    }
    else{
      console.log("dataset id not found")
    }
  });

  parser.on('error', (err) => {
    console.error('Error parsing JSON file:', err);
  });
};

// Function to insert a batch of data into the contracts_dataset
const insertBatchIntoContractsDataset = async (batch: any[],retries=3) => {
  const collectionId = '66d6f64d002fcf2c16bc';  // contracts_dataset collection ID
  
  try {
    for (const record of batch) {
      const documentData = {
        reference_number: record[0]?.substring(0, 50),
        procurement_id: record[1]?.substring(0, 50),
        vendor_name: record[2]?.substring(0, 50),
        vendor_postal_code: record[3]?.substring(0, 50),
        buyer_name: record[4]?.substring(0, 50),
        contract_date: record[5]?.substring(0, 50),
        economic_object_code: record[6]?.substring(0, 50),
        description_en: record[7]?.substring(0, 50),
        description_fr: record[8]?.substring(0, 50),
        contract_period_start: record[9]?.substring(0, 50),
        delivery_date: record[10]?.substring(0, 50),
        contract_value: record[11]?.substring(0, 50),
        original_value: record[12]?.substring(0, 50),
        amendment_value: record[13]?.substring(0, 50),
        comments_en: record[14]?.substring(0, 50),
        comments_fr: record[15]?.substring(0, 50),
        additional_comments_en: record[16]?.substring(0, 50),
        additional_comments_fr: record[17]?.substring(0, 50),
        agreement_type_code: record[18]?.substring(0, 50),
        trade_agreement: record[19]?.substring(0, 50),
        land_claims: record[20]?.substring(0, 50),
        commodity_type: record[21]?.substring(0, 50),
        commodity_code: record[22]?.substring(0, 50),
        country_of_vendor: record[23]?.substring(0, 50),
        solicitation_procedure: record[24]?.substring(0, 50),
        limited_tendering_reason: record[25]?.substring(0, 50),
        trade_agreement_exceptions: record[26]?.substring(0, 50),
        indigenous_business: record[27]?.substring(0, 50),
        indigenous_business_excluding_psib: record[28]?.substring(0, 50),
        intellectual_property: record[29]?.substring(0, 50),
        potential_commercial_exploitation: record[30]?.substring(0, 50),
        former_public_servant: record[31]?.substring(0, 50),
        contracting_entity: record[32]?.substring(0, 50),
        standing_offer_number: record[33]?.substring(0, 50),
        instrument_type: record[34]?.substring(0, 50),
        ministers_office: record[35]?.substring(0, 50),
        number_of_bids: record[36]?.substring(0, 50),
        article_6_exceptions: record[37]?.substring(0, 50),
        award_criteria: record[38]?.substring(0, 50),
        socioeconomic_indicator: record[39]?.substring(0, 50),
        reporting_period: record[40]?.substring(0, 50),
        // owner_org: record[41]?.substring(0, 50),
        // owner_org_title: record[42]?.substring(0, 50)
      };

      // Insert document into contracts_dataset
    const dataset = await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID || '',  // Database ID
        collectionId,  // contracts_dataset collection ID
        'unique()',  // Auto-generate document ID
        documentData
      );
      lastDatasetId = dataset.$id
      await sleep(100);
    }
   
    console.log(`Inserted batch of ${batch.length} records into contracts_dataset.`);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying insertion... Attempts remaining: ${retries}`);
      return await insertBatchIntoContractsDataset(batch, retries - 1);  // Retry
    } else {
      console.error('Error inserting batch into contracts_dataset:', error);
      return null;
    }
  }
};

// Function to update subcategory with the dataset ID
const updateSubcategoryWithDatasetId = async (subCategoryId: string,datasetId:string) => {
  const subCategoryCollectionId = '66d6ee3700099dc89393';  // Replace with actual subcategory collection ID

  try {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || '',  // Database ID
      subCategoryCollectionId,  // Subcategory collection ID
      subCategoryId,  // Subcategory document ID
      { dataset_id: datasetId }
    );

    console.log(`Updated subcategory ${subCategoryId} with dataset_id ${datasetId}.`);
  } catch (error) {
    console.error('Error updating subcategory with dataset ID:', error);
  }
};

// Main function to start the batch process
//66d8593f002d6699dcad
export const startBatchProcess = async (subCategoryId: string,filePath:string) => {
  await processJsonFileInBatches(filePath, subCategoryId);
};


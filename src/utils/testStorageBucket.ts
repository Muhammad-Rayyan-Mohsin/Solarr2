/**
 * Storage Bucket Test Utility
 * 
 * This utility helps verify if the Supabase storage bucket is properly configured
 * and files are being stored correctly.
 */

import { supabase } from "@/integrations/supabase/client";

export interface BucketTestResult {
  connected: boolean;
  bucketExists: boolean;
  canUpload: boolean;
  canDownload: boolean;
  canList: boolean;
  filesCount: number;
  errors: string[];
  details: {
    bucketName: string;
    testFilePath?: string;
    sampleFiles?: string[];
  };
}

/**
 * Test the staging-uploads bucket connection and functionality
 */
export async function testStagingUploadsBucket(): Promise<BucketTestResult> {
  const result: BucketTestResult = {
    connected: false,
    bucketExists: false,
    canUpload: false,
    canDownload: false,
    canList: false,
    filesCount: 0,
    errors: [],
    details: {
      bucketName: 'staging-uploads'
    }
  };

  try {
    // 1. Check if we can connect to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[Storage Test] User:', user?.id || 'anonymous');
    result.connected = true;

    // 2. Try to list files in the bucket (this confirms bucket exists)
    console.log('[Storage Test] Listing files in staging-uploads bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('staging-uploads')
      .list('staging', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
        result.errors.push(`Bucket 'staging-uploads' does not exist: ${listError.message}`);
        result.bucketExists = false;
      } else {
        result.errors.push(`List error: ${listError.message}`);
        result.bucketExists = true; // Bucket exists but might have permission issues
      }
    } else {
      result.bucketExists = true;
      result.canList = true;
      result.filesCount = files?.length || 0;
      result.details.sampleFiles = files?.slice(0, 5).map(f => f.name) || [];
      console.log(`[Storage Test] Found ${result.filesCount} files/folders in staging directory`);
    }

    // 3. Test upload capability (create a small test file)
    console.log('[Storage Test] Testing upload capability...');
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = `staging/test/${testFileName}`;
    const testFileContent = new Blob(['Storage test file'], { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('staging-uploads')
      .upload(testFilePath, testFileContent, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      result.errors.push(`Upload test failed: ${uploadError.message}`);
      result.canUpload = false;
    } else {
      result.canUpload = true;
      result.details.testFilePath = uploadData.path;
      console.log('[Storage Test] Upload successful:', uploadData.path);

      // 4. Test download capability
      console.log('[Storage Test] Testing download capability...');
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('staging-uploads')
        .download(testFilePath);

      if (downloadError) {
        result.errors.push(`Download test failed: ${downloadError.message}`);
        result.canDownload = false;
      } else {
        result.canDownload = true;
        console.log('[Storage Test] Download successful, size:', downloadData.size, 'bytes');
      }

      // 5. Clean up test file
      console.log('[Storage Test] Cleaning up test file...');
      await supabase.storage
        .from('staging-uploads')
        .remove([testFilePath]);
    }

  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    console.error('[Storage Test] Unexpected error:', error);
  }

  return result;
}

/**
 * Get list of all files in the staging-uploads bucket (recursively)
 */
export async function listAllStagingFiles(path: string = 'staging'): Promise<{
  files: Array<{ name: string; path: string; size: number; created_at: string }>;
  folders: string[];
  error?: string;
}> {
  try {
    const allFiles: Array<{ name: string; path: string; size: number; created_at: string }> = [];
    const allFolders: string[] = [];

    // Function to recursively list all files
    async function listRecursively(currentPath: string) {
      const { data: items, error } = await supabase.storage
        .from('staging-uploads')
        .list(currentPath, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw error;
      }

      if (!items) return;

      // Process files (items with id)
      const files = items.filter(f => f.id);
      files.forEach(f => {
        allFiles.push({
          name: f.name,
          path: `${currentPath}/${f.name}`,
          size: f.metadata?.size || 0,
          created_at: f.created_at || ''
        });
      });

      // Process folders (items without id)
      const folders = items.filter(f => !f.id);
      for (const folder of folders) {
        allFolders.push(`${currentPath}/${folder.name}`);
        // Recursively list contents of this folder
        await listRecursively(`${currentPath}/${folder.name}`);
      }
    }

    await listRecursively(path);

    return { files: allFiles, folders: allFolders };
  } catch (error) {
    return {
      files: [],
      folders: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get stored assets from the database
 */
export async function getStoredAssets(limit: number = 50): Promise<{
  assets: Array<{
    id: string;
    survey_id: string;
    section: string;
    field: string;
    kind: string;
    storage_object_path: string;
    mime_type: string | null;
    byte_size: number | null;
    created_at: string;
  }>;
  error?: string;
}> {
  try {
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { assets: [], error: error.message };
    }

    return { assets: assets || [] };
  } catch (error) {
    return {
      assets: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Verify that stored files in bucket match database records
 */
export async function verifyStorageIntegrity(): Promise<{
  totalAssets: number;
  verifiedFiles: number;
  missingFiles: string[];
  orphanedFiles: string[];
  status: 'healthy' | 'issues' | 'error';
  error?: string;
}> {
  try {
    // Get all assets from database
    const { assets, error: dbError } = await getStoredAssets(1000);
    if (dbError) {
      return {
        totalAssets: 0,
        verifiedFiles: 0,
        missingFiles: [],
        orphanedFiles: [],
        status: 'error',
        error: dbError
      };
    }

    const missingFiles: string[] = [];
    let verifiedCount = 0;

    // Check if each asset file exists in storage
    for (const asset of assets) {
      try {
        const { error } = await supabase.storage
          .from('staging-uploads')
          .download(asset.storage_object_path);

        if (error) {
          missingFiles.push(asset.storage_object_path);
        } else {
          verifiedCount++;
        }
      } catch (e) {
        missingFiles.push(asset.storage_object_path);
      }
    }

    const status = missingFiles.length === 0 ? 'healthy' : 'issues';

    return {
      totalAssets: assets.length,
      verifiedFiles: verifiedCount,
      missingFiles,
      orphanedFiles: [], // Would need deeper analysis
      status
    };
  } catch (error) {
    return {
      totalAssets: 0,
      verifiedFiles: 0,
      missingFiles: [],
      orphanedFiles: [],
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Print formatted test results
 */
export function printTestResults(result: BucketTestResult): void {
  console.log('\n=== SUPABASE STORAGE TEST RESULTS ===');
  console.log(`Bucket: ${result.details.bucketName}`);
  console.log(`Connected to Supabase: ${result.connected ? '✅' : '❌'}`);
  console.log(`Bucket exists: ${result.bucketExists ? '✅' : '❌'}`);
  console.log(`Can upload: ${result.canUpload ? '✅' : '❌'}`);
  console.log(`Can download: ${result.canDownload ? '✅' : '❌'}`);
  console.log(`Can list files: ${result.canList ? '✅' : '❌'}`);
  console.log(`Files/folders in staging: ${result.filesCount}`);
  
  if (result.details.sampleFiles && result.details.sampleFiles.length > 0) {
    console.log('\nSample files/folders:');
    result.details.sampleFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.canUpload && result.canDownload && result.bucketExists) {
    console.log('\n✅ Storage is working correctly!');
  } else {
    console.log('\n⚠️ Storage has some issues that need attention.');
  }
  console.log('=====================================\n');
}


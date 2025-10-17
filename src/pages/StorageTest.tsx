import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  testStagingUploadsBucket, 
  listAllStagingFiles,
  getStoredAssets,
  verifyStorageIntegrity,
  printTestResults,
  type BucketTestResult 
} from "@/utils/testStorageBucket";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Database, HardDrive, FileCheck, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function StorageTest() {
  const [testResult, setTestResult] = useState<BucketTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [integrity, setIntegrity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'test' | 'files' | 'assets' | 'integrity'>('test');
  const [authError, setAuthError] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setIsAuthenticated(!!user);
    console.log('[Auth Check]', user ? `Authenticated as ${user.email}` : 'Not authenticated');
  };

  const runTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      const result = await testStagingUploadsBucket();
      setTestResult(result);
      printTestResults(result);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const loadFiles = async () => {
    setIsRunning(true);
    setAuthError('');
    try {
      const result = await listAllStagingFiles('staging');
      setFiles(result.files);
      setFolders(result.folders);
      if (result.error) {
        setAuthError(result.error);
      }
      console.log('Files:', result);
    } catch (error) {
      console.error('Failed to load files:', error);
      setAuthError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunning(false);
    }
  };

  const loadAssets = async () => {
    setIsRunning(true);
    setAuthError('');
    try {
      const result = await getStoredAssets(100);
      setAssets(result.assets);
      if (result.error) {
        setAuthError(result.error);
      }
      console.log('Assets:', result);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAuthError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunning(false);
    }
  };

  const checkIntegrity = async () => {
    setIsRunning(true);
    try {
      const result = await verifyStorageIntegrity();
      setIntegrity(result);
      console.log('Integrity check:', result);
    } catch (error) {
      console.error('Failed to check integrity:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Supabase Storage Test</h1>
          <p className="text-muted-foreground">
            Verify your staging-uploads bucket connection and file storage integrity
          </p>
        </div>

        {/* Authentication Status Banner */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                  ⚠️ Not Authenticated
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  You are not logged in. Most tests require authentication to access the database and storage.
                  The "Database Assets" and "Integrity Check" tabs will fail with 401 errors.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = '/survey'}
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Go to Survey (Login Required)
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={checkAuth}
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                  >
                    Refresh Auth Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && user && (
          <div className="mb-6 p-4 border-2 border-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                ✅ Authenticated as: {user.email}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'test'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connection Test
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'files'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Storage Files
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'assets'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Database Assets
          </button>
          <button
            onClick={() => setActiveTab('integrity')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'integrity'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Integrity Check
          </button>
        </div>

        {/* Connection Test Tab */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Connection Test</CardTitle>
                <CardDescription>
                  Test the connection and permissions for the staging-uploads bucket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={runTest} disabled={isRunning} className="w-full sm:w-auto">
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    'Run Storage Test'
                  )}
                </Button>

                {testResult && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Supabase Connected</span>
                        <StatusIcon status={testResult.connected} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Bucket Exists</span>
                        <StatusIcon status={testResult.bucketExists} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Can Upload</span>
                        <StatusIcon status={testResult.canUpload} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Can Download</span>
                        <StatusIcon status={testResult.canDownload} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Can List Files</span>
                        <StatusIcon status={testResult.canList} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Files/Folders Count</span>
                        <span className="font-bold text-lg">{testResult.filesCount}</span>
                      </div>
                    </div>

                    {testResult.details.sampleFiles && testResult.details.sampleFiles.length > 0 && (
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Sample Files/Folders:</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {testResult.details.sampleFiles.map((file, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{file}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {testResult.errors.length > 0 && (
                      <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Errors:</h3>
                            <ul className="space-y-1">
                              {testResult.errors.map((error, idx) => (
                                <li key={idx} className="text-sm text-red-600 dark:text-red-300">{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={`p-4 border rounded-lg ${
                      testResult.canUpload && testResult.canDownload && testResult.bucketExists
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                        : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        {testResult.canUpload && testResult.canDownload && testResult.bucketExists ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-700 dark:text-green-400">
                              ✅ Storage is working correctly!
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                              ⚠️ Storage has some issues that need attention.
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Storage Files Tab */}
        {activeTab === 'files' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Files in Storage Bucket
              </CardTitle>
              <CardDescription>
                List all files stored in the staging-uploads bucket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadFiles} disabled={isRunning} className="mb-4">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Files'
                )}
              </Button>

              {authError && (
                <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-400">Error</h3>
                      <p className="text-sm text-red-600 dark:text-red-300">{authError}</p>
                    </div>
                  </div>
                </div>
              )}

              {(files.length > 0 || folders.length > 0) && (
                <div className="space-y-4">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>📁 {folders.length} folder(s)</span>
                    <span>📄 {files.length} file(s)</span>
                  </div>

                  {folders.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Folders:</h3>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {folders.map((folder, idx) => (
                          <div key={idx} className="p-2 border rounded bg-blue-50 dark:bg-blue-900/20">
                            <p className="font-mono text-xs text-muted-foreground">{folder}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Files:</h3>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {files.map((file, idx) => (
                          <div key={idx} className="p-3 border rounded-lg flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.path}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(file.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!authError && files.length === 0 && folders.length === 0 && (
                <p className="text-sm text-muted-foreground">No files or folders found. Click "Load Files" to scan.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Database Assets Tab */}
        {activeTab === 'assets' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Assets in Database
              </CardTitle>
              <CardDescription>
                List all asset records from the assets table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadAssets} disabled={isRunning} className="mb-4">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Assets'
                )}
              </Button>

              {authError && (
                <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-400">Authentication/Permission Error</h3>
                      <p className="text-sm text-red-600 dark:text-red-300 mb-2">{authError}</p>
                      <p className="text-xs text-red-500">
                        You need to enable RLS policies on the assets table. See the SQL fix below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {assets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Found {assets.length} asset(s)
                  </p>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {assets.map((asset) => (
                      <div key={asset.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{asset.field}</p>
                            <p className="text-xs text-muted-foreground">{asset.section}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {asset.kind}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {asset.storage_object_path}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{asset.mime_type}</span>
                          <span>{asset.byte_size ? `${(asset.byte_size / 1024).toFixed(2)} KB` : 'N/A'}</span>
                          <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Integrity Check Tab */}
        {activeTab === 'integrity' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Storage Integrity Check
              </CardTitle>
              <CardDescription>
                Verify that database records match actual files in storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={checkIntegrity} disabled={isRunning} className="mb-4">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Run Integrity Check'
                )}
              </Button>

              {integrity && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold">{integrity.totalAssets}</p>
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{integrity.verifiedFiles}</p>
                      <p className="text-sm text-muted-foreground">Verified Files</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{integrity.missingFiles.length}</p>
                      <p className="text-sm text-muted-foreground">Missing Files</p>
                    </div>
                  </div>

                  <div className={`p-4 border rounded-lg ${
                    integrity.status === 'healthy'
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                      : integrity.status === 'issues'
                      ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      {integrity.status === 'healthy' ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            Storage integrity is healthy!
                          </span>
                        </>
                      ) : integrity.status === 'issues' ? (
                        <>
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                            Found some integrity issues
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-red-700 dark:text-red-400">
                            Error checking integrity
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {integrity.missingFiles.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2 text-red-600">Missing Files:</h3>
                      <ul className="space-y-1 max-h-48 overflow-y-auto">
                        {integrity.missingFiles.map((file: string, idx: number) => (
                          <li key={idx} className="text-sm font-mono text-muted-foreground">{file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


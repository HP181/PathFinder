'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Upload, File, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define form schema
const analyzeFormSchema = z.object({
  targetRole: z.string().min(2, { message: 'Please enter your target role' }),
  targetIndustry: z.string().min(2, { message: 'Please enter your target industry' }),
});

export function ResumeBuilder() {
  // State management
  const [activeTab, setActiveTab] = useState('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable' | 'mock'>('checking');
  const [improvementMode, setImprovementMode] = useState(false);
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  
  // Access profile and auth stores
  const { profile, updateProfile } = useProfileStore();
  const { user } = useAuthStore();
  
  // Check if user has uploaded a resume
  const hasResume = typeof profile?.resumeUrl === 'string' && profile.resumeUrl.trim() !== '';

  // Initialize analysis form
  const analyzeForm = useForm<z.infer<typeof analyzeFormSchema>>({
    resolver: zodResolver(analyzeFormSchema),
    defaultValues: {
      targetRole: '',
      targetIndustry: '',
    },
  });

  // Debug profile data on component mount
  useEffect(() => {
    console.log('Profile data:', {
      hasProfile: !!profile,
      resumeUrl: profile?.resumeUrl,
      hasResumeData: !!profile?.resumeData,
      resumeDataType: typeof profile?.resumeData,
    });
    
    if (profile?.resumeData) {
      console.log('Resume data sample:', 
        typeof profile.resumeData === 'string' 
          ? profile.resumeData.substring(0, 100) + '...'
          : JSON.stringify(profile.resumeData).substring(0, 100) + '...');
    }
  }, [profile]);
  
  // Check API health on component mount
  useEffect(() => {
    async function checkApiHealth() {
      try {
        const response = await fetch('/api/analyze-resume');
        const health = await response.json();
        
        if (health.mockEnabled) {
          setApiStatus('mock');
          console.log('🧪 Resume analysis API is running in MOCK mode');
        } else if (health.status === 'success') {
          setApiStatus('available');
          console.log('✅ Resume analysis API is available (GenAI)');
        } else {
          setApiStatus('unavailable');
          console.warn('⚠️ Resume analysis API is unavailable:', health.message);
        }
      } catch (error) {
        console.error('❌ Error checking API health:', error);
        setApiStatus('unavailable');
      }
    }
    
    checkApiHealth();
  }, []);
  
  // Extract resume text and URL from profile data
  const getResumeData = () => {
    const resumeText = typeof profile?.resumeData === 'string' 
      ? profile.resumeData 
      : typeof profile?.resumeData === 'object' && profile?.resumeData?.rawText
        ? profile.resumeData.rawText
        : '';
    
    const resumeUrl = profile?.resumeUrl || '';
    
    return { resumeText, resumeUrl };
  };
  
  // Handle analyze form submission
  const handleAnalyze = async (values: z.infer<typeof analyzeFormSchema>) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const { resumeText, resumeUrl } = getResumeData();
    
    // Prepare API data
    const apiData = {
      resumeData: {
        rawText: resumeText,
        url: resumeUrl
      },
      targetRole: values.targetRole,
      targetIndustry: values.targetIndustry,
    };
    
    console.log('Sending resume data for analysis:', {
      ...apiData,
      resumeData: {
        ...apiData.resumeData,
        rawText: apiData.resumeData.rawText.substring(0, 100) + '...' // Truncate for logging
      }
    });
    
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      // Get raw response text first
      const rawText = await response.text();
      console.log(`Raw API response (${response.status}):`);
      console.log(rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
      
      if (!response.ok) {
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(rawText);
          throw new Error(errorData.error || 'Failed to analyze resume');
        } catch (jsonError) {
          // If not valid JSON, use the raw text
          throw new Error(`API error: ${rawText}`);
        }
      }

      // If we got here, try to parse the successful response
      try {
        const result = JSON.parse(rawText);
        console.log('Successfully parsed response JSON');
        
        // Check if this is mock data
        if (result._notice) {
          toast.info(result._notice);
        }
        
        setAnalysisResult(result);
        
        // Auto-switch to the results tab
        setActiveTab('results');
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during resume analysis.');
      console.error('Full error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate improved resume based on analysis
  const handleGenerateImprovement = async () => {
    if (!analysisResult) return;
    
    setImprovementMode(true);
    setImprovedResume(null);
    
    const { resumeText } = getResumeData();
    const { targetRole, targetIndustry } = analyzeForm.getValues();
    
    try {
      // Prepare API data for improvement request
      const apiData = {
        resumeData: {
          rawText: resumeText,
          url: profile?.resumeUrl || ''
        },
        targetRole,
        targetIndustry,
        analysisResult,
        action: 'improve'
      };
      
      const response = await fetch('/api/improve-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate improved resume');
      }
      
      setImprovedResume(result.improvedResume);
      toast.success('Improved resume generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while generating improved resume');
      console.error('Error generating improved resume:', error);
    } finally {
      setImprovementMode(false);
    }
  };
  
  // Save improved resume to profile
  const handleSaveImprovement = async () => {
    if (!improvedResume) return;
    
    try {
      // Update the profile with the improved resume text
      await updateProfile({
        ...profile,
        resumeData: improvedResume
      });
      
      toast.success('Improved resume saved to your profile!');
    } catch (error: any) {
      toast.error('Failed to save improved resume');
      console.error('Error saving improvement:', error);
    }
  };
  
  // Handle file upload for resume
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsLoading(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      const uploadResponse = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Failed to upload resume');
      }
      
      // Update profile with the new resume data
      await updateProfile({
        ...profile,
        resumeUrl: uploadResult.url,
        resumeData: uploadResult.text
      });
      
      toast.success('Resume uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during file upload');
      console.error('File upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="analyze">Analyze Resume</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult}>Results</TabsTrigger>
        </TabsList>
        
        {/* Upload Resume Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your resume to get AI-powered feedback and improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hasResume ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <File className="h-6 w-6 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium">Resume Uploaded</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.resumeUrl?.split('/').pop()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(profile?.resumeUrl, '_blank')}>
                      View
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">Upload Your Resume</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop or click to browse
                    </p>
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : 'Browse Files'}
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <Button 
                    variant={hasResume ? "default" : "outline"} 
                    disabled={!hasResume || isLoading} 
                    onClick={() => setActiveTab('analyze')}
                  >
                    Continue to Analysis
                  </Button>
                  
                  {hasResume && (
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      disabled={isLoading}
                    >
                      Upload New Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analyze Resume Tab */}
        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>Resume Analysis</CardTitle>
              <CardDescription>
                Get AI-powered feedback on your resume for the Canadian job market
                {apiStatus === 'mock' && (
                  <span className="block mt-1 text-amber-500">
                    ⚠️ Running in demo mode (not using actual AI analysis)
                  </span>
                )}
                {apiStatus === 'available' && (
                  <span className="block mt-1 text-green-500">
                    ✅ Using Google's GenAI for analysis
                  </span>
                )}
                {apiStatus === 'unavailable' && (
                  <span className="block mt-1 text-red-500">
                    ⚠️ AI service unavailable - analysis may not work
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasResume ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                  <p className="text-lg font-medium">No Resume Found</p>
                  <p className="text-sm text-muted-foreground mt-1 text-center">
                    Please upload your resume before analysis.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab('upload')}>
                    Upload Resume
                  </Button>
                </div>
              ) : (
                <Form {...analyzeForm}>
                  <form onSubmit={analyzeForm.handleSubmit(handleAnalyze)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={analyzeForm.control}
                        name="targetRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Role</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Software Engineer" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              The job title you're targeting
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={analyzeForm.control}
                        name="targetIndustry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Industry</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Technology" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              The industry you want to work in
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || apiStatus === 'checking'}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : apiStatus === 'checking' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking API...
                        </>
                      ) : 'Analyze Resume'}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium">Analyzing your resume...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We're evaluating your resume against Canadian job market standards.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : analysisResult ? (
            <div className="space-y-6">
              {/* Actions Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Resume Analysis Complete</h3>
                      <p className="text-sm text-muted-foreground">
                        Review the feedback below and consider improvements
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('analyze')}
                      >
                        New Analysis
                      </Button>
                      <Button
                        onClick={handleGenerateImprovement}
                        disabled={improvementMode}
                      >
                        {improvementMode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : 'Improve Resume'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Strengths Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Strengths
                  </CardTitle>
                  <CardDescription>
                    What's working well in your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Areas for Improvement Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                  <CardDescription>
                    What could be enhanced in your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.improvementAreas?.map((area: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Canadian Market Fit Card */}
              {analysisResult.canadianMarketFit && (
                <Card>
                  <CardHeader>
                    <CardTitle>Canadian Market Fit</CardTitle>
                    <CardDescription>
                      How well your resume matches Canadian job market expectations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{analysisResult.canadianMarketFit}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Skill Gaps Card */}
              {analysisResult.skillGaps && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      Skill Gaps
                    </CardTitle>
                    <CardDescription>
                      Skills you might want to develop for your target role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.skillGaps?.map((gap: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {/* Recommended Changes Card */}
              {analysisResult.recommendedChanges && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Changes</CardTitle>
                    <CardDescription>
                      Specific changes to make your resume more appealing to Canadian employers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.recommendedChanges?.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                            <span className="text-primary font-medium">{index + 1}</span>
                          </div>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {/* Improved Resume Card (if generated) */}
              {improvedResume && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="h-5 w-5 text-blue-500 mr-2" />
                      Improved Resume
                    </CardTitle>
                    <CardDescription>
                      AI-generated improvements based on analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={improvedResume}
                      onChange={(e) => setImprovedResume(e.target.value)}
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Create and download a text file
                          const element = document.createElement('a');
                          const file = new Blob([improvedResume], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = 'improved_resume.txt';
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                      >
                        Download
                      </Button>
                      <Button onClick={handleSaveImprovement}>
                        Save to Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-10">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                  <p className="text-lg font-medium">No Analysis Results</p>
                  <p className="text-sm text-muted-foreground mt-1 text-center">
                    Please analyze your resume first.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab('analyze')}>
                    Go to Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
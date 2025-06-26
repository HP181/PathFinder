'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { createOrUpdateProfile, ImmigrantProfile } from '@/lib/Firebase/Firestore';
import { Loader2, Upload, File } from 'lucide-react';
import { storage } from '@/lib/Firebase/Config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// List of countries
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 
  'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 
  'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 
  'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 
  'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 
  'Yemen', 'Zambia', 'Zimbabwe'
];

// Form schema
const formSchema = z.object({
  credential: z.string().min(2, { message: 'Please enter your credential name' }),
  country: z.string().min(2, { message: 'Please select your country' }),
  industry: z.string().min(2, { message: 'Please enter your industry' }),
});

interface CredentialResult {
  canadianEquivalent: string;
  requiredLicenses: string[];
  recommendedActions: string[];
  explanation: string;
}

export function CredentialAssessment() {
  const [isUploading, setIsUploading] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<CredentialResult | null>(null);
  
  const { user } = useAuthStore();
  const { profile, updateProfile } = useProfileStore();

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credential: '',
      country: '',
      industry: '',
    },
  });

  // Check for existing credential document on mount
  useEffect(() => {
    if (profile && 'credentialDocumentUrl' in profile) {
      setDocumentUrl(profile.credentialDocumentUrl as string);
      
      // Extract document name from URL
      if (profile.credentialDocumentUrl) {
        const url = profile.credentialDocumentUrl as string;
        const fileName = url.split('/').pop()?.split('?')[0] || 'credential-document.pdf';
        setDocumentName(fileName);
      }
    }
  }, [profile]);
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Check file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    
    setIsUploading(true);
    setDocumentUrl(null);
    
    try {
      // Create a reference to Firebase Storage
      const storageRef = ref(storage, `credentials/${user.uid}/${file.name}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const url = await getDownloadURL(storageRef);
      
      // Update state
      setDocumentUrl(url);
      setDocumentName(file.name);
      
      // Update profile
      if (profile) {
        const updatedProfile = {
          ...profile,
          credentialDocumentUrl: url
        };
        
        // Update in Firestore
        await createOrUpdateProfile(updatedProfile as ImmigrantProfile);
        
        // Update local state
        updateProfile(updatedProfile);
      }
      
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!documentUrl) {
      toast.error('Please upload your credential document');
      return;
    }
    
    setIsAssessing(true);
    setAssessmentResult(null);
    
    try {
      // Call the credential assessment API
      const response = await fetch('/api/credential-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: values.credential,
          country: values.country,
          industry: values.industry,
          documentUrl: documentUrl
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assess credentials');
      }
      
      const result = await response.json();
      setAssessmentResult(result);
      
      // Update profile with assessment result
      if (profile) {
        const updatedProfile = {
          ...profile,
          credentialAssessment: result
        };
        
        // Update in Firestore
        await createOrUpdateProfile(updatedProfile as ImmigrantProfile);
        
        // Update local state
        updateProfile(updatedProfile);
      }
      
      toast.success('Credential assessment completed');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during credential assessment');
      console.error('Error assessing credentials:', error);
    } finally {
      setIsAssessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Educational Credential Assessment</CardTitle>
          <CardDescription>
            Find out how your educational credentials from your home country are recognized in Canada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Your Credential Document</h3>
              <p className="text-sm text-muted-foreground">
                Upload your degree or diploma certificate as a PDF file
              </p>
              
              {documentUrl ? (
                <div className="p-4 border rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-6 w-6 mr-2 text-blue-500" />
                    <div>
                      <p className="font-medium">Document Uploaded</p>
                      <p className="text-sm text-muted-foreground">{documentName}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(documentUrl, '_blank')}>
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('document-upload')?.click()}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">Upload Your Credential Document</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to browse
                  </p>
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('document-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : 'Browse Files'}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Credential Assessment Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="credential"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credential Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Bachelor of Science in Computer Science" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the full name of your degree or diploma
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Origin</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The country where you earned your credential
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Information Technology" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The industry related to your credential
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isAssessing || !documentUrl}
                >
                  {isAssessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assessing...
                    </>
                  ) : 'Assess Credential'}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
      
      {/* Assessment Results */}
      {assessmentResult && (
        <Card>
          <CardHeader>
            <CardTitle>Credential Assessment Results</CardTitle>
            <CardDescription>
              How your credentials are recognized in the Canadian system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Canadian Equivalent</h3>
              <p className="p-4 bg-primary/10 rounded-md">{assessmentResult.canadianEquivalent}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Required Licenses or Certifications</h3>
              <ul className="space-y-2">
                {assessmentResult.requiredLicenses.map((license, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <span className="text-primary font-medium">{index + 1}</span>
                    </div>
                    <span>{license}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Recommended Actions</h3>
              <ul className="space-y-2">
                {assessmentResult.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <span className="text-primary font-medium">{index + 1}</span>
                    </div>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Explanation</h3>
              <p className="text-muted-foreground">{assessmentResult.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
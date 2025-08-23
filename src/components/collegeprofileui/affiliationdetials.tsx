import React, { useState, useEffect } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import axios from 'axios'

// TypeScript interfaces for type safety
interface NatureSelections {
  private: boolean
  government: boolean
  selfFinancing: boolean
  grantInAid: boolean
}

interface SRAProgram {
  id: string
  sraType: string
  document: File | null
  documentUrl?: string
}

interface AffiliationFormData {
  natureOfCollege: string[]
  collegeAffiliation: string
  universityName: string
  universityState: string
  affiliationDocument: string | null
  ugcRecognition: string
  ugcDocument: string | null
  ugc12BRecognition: string
  ugc12BDocument: string | null
  autonomousCollege: string
  autonomousCollegeDocument: string | null
  cpeRecognition: string
  cpeDocument: string | null
  collegeOfExcellence: string
  collegeOfExcellenceDocument: string | null
  sraPrograms: string
  sraProgramList: Array<{
    id: string
    sraType: string
    documentUrl: string | null
  }>
  aiuRecognition: string
  aiuDocument: string | null
  id: string
}

// S3 Upload utility function with better error handling
const uploadFileToS3 = async (file: File): Promise<string | null> => {
  try {
    console.log('Starting file upload for:', file.name);
    
    // Get upload URL from the backend
    const response = await axios.get(
      "https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/upload-url",
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('Upload URL response:', response.data);
    const { uploadUrl, fileUrl } = response.data;

    if (!uploadUrl || !fileUrl) {
      throw new Error('Invalid response from upload URL endpoint');
    }

    // Upload the file to S3 using PUT
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      timeout: 60000, // 60 second timeout for file upload
      onUploadProgress: (progressEvent) => {
        if (typeof progressEvent.total === 'number' && progressEvent.total > 0) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    });

    console.log('File uploaded successfully. File URL:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("S3 upload failed:", error);
    
    // More detailed error handling
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'ERR_NETWORK') {
      throw new Error(`Network error while uploading ${file.name}. Please check your internet connection.`);
    } else if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'ECONNABORTED') {
      throw new Error(`Upload timeout for ${file.name}. Please try again.`);
    } else if (typeof error === 'object' && error !== null && 'response' in error) {
      const err = error as any;
      throw new Error(`Upload failed for ${file.name}: ${err.response.status} ${err.response.statusText}`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    } else {
      throw new Error(`Failed to upload ${file.name}: Unknown error`);
    }
  }
};

// Function to fetch existing form data
const fetchExistingData = async (questionId: string): Promise<AffiliationFormData | null> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, starting with empty form');
      return null;
    }

    const response = await axios.get(
      'https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/answers?questionId=iiqa2',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log("GET response:", response.data);
    const allAnswers = response.data;

    // Find iiqa2
    const iiqa2Data = allAnswers.find((item: { questionId: string }) => item.questionId === "iiqa2");

    if (iiqa2Data && iiqa2Data.answer) {
      console.log("iiqa2 answer:", iiqa2Data.answer);
      return iiqa2Data.answer;
    } else {
      console.log("No data found for iiqa2");
      return null;
    }
  } catch (error) {
    console.error('Error fetching existing data:', error);
    return null;
  }
};

export const Affiliationdetials = () => {
  // State management
  const [natureSelections, setNatureSelections] = useState<NatureSelections>({
    private: false,
    government: false,
    selfFinancing: false,
    grantInAid: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [collegeAffiliation, setCollegeAffiliation] = useState('')
  const [universityName, setUniversityName] = useState('')
  const [universityState, setUniversityState] = useState('')
  
  // File states
  const [affiliationDocument, setAffiliationDocument] = useState<File | null>(null)
  const [affiliationDocumentUrl, setAffiliationDocumentUrl] = useState<string>('')
  const [ugcRecognition, setUgcRecognition] = useState('')
  const [ugcDocument, setUgcDocument] = useState<File | null>(null)
  const [ugcDocumentUrl, setUgcDocumentUrl] = useState<string>('')
  const [ugc12BRecognition, setUgc12BRecognition] = useState('')
  const [ugc12BDocument, setUgc12BDocument] = useState<File | null>(null)
  const [ugc12BDocumentUrl, setUgc12BDocumentUrl] = useState<string>('')
  const [autonomousCollege, setAutonomousCollege] = useState('')
  const [autonomousCollegeDocument, setAutonomousCollegeDocument] = useState<File | null>(null)
  const [autonomousCollegeDocumentUrl, setAutonomousCollegeDocumentUrl] = useState<string>('')
  const [cpeRecognition, setCpeRecognition] = useState('')
  const [cpeDocument, setCpeDocument] = useState<File | null>(null)
  const [cpeDocumentUrl, setCpeDocumentUrl] = useState<string>('')
  const [collegeOfExcellence, setCollegeOfExcellence] = useState('')
  const [collegeOfExcellenceDocument, setCollegeOfExcellenceDocument] = useState<File | null>(null)
  const [collegeOfExcellenceDocumentUrl, setCollegeOfExcellenceDocumentUrl] = useState<string>('')
  const [sraPrograms, setSraPrograms] = useState('')
  const [sraProgramList, setSraProgramList] = useState<SRAProgram[]>([])
  const [aiuRecognition, setAiuRecognition] = useState('')
  const [aiuDocument, setAiuDocument] = useState<File | null>(null)
  const [aiuDocumentUrl, setAiuDocumentUrl] = useState<string>('')

  // India states data
  const indiaStates = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Delhi", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ]

  // Load existing data on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        const existingData = await fetchExistingData("iiqa2");
        
        if (existingData) {
          console.log("Loading existing data:", existingData);
          
          // Populate nature of college checkboxes
          const natureObj = {
            private: false,
            government: false,
            selfFinancing: false,
            grantInAid: false
          };
          
          if (existingData.natureOfCollege && Array.isArray(existingData.natureOfCollege)) {
            existingData.natureOfCollege.forEach((nature: string) => {
              if (nature in natureObj) {
                natureObj[nature as keyof NatureSelections] = true;
              }
            });
          }
          setNatureSelections(natureObj);

          // Populate other fields with proper fallbacks
          setCollegeAffiliation(existingData.collegeAffiliation || '');
          setUniversityName(existingData.universityName || '');
          setUniversityState(existingData.universityState || '');
          setAffiliationDocumentUrl(existingData.affiliationDocument || '');
          setUgcRecognition(existingData.ugcRecognition || '');
          setUgcDocumentUrl(existingData.ugcDocument || '');
          setUgc12BRecognition(existingData.ugc12BRecognition || '');
          setUgc12BDocumentUrl(existingData.ugc12BDocument || '');
          setAutonomousCollege(existingData.autonomousCollege || '');
          setAutonomousCollegeDocumentUrl(existingData.autonomousCollegeDocument || '');
          setCpeRecognition(existingData.cpeRecognition || '');
          setCpeDocumentUrl(existingData.cpeDocument || '');
          setCollegeOfExcellence(existingData.collegeOfExcellence || '');
          setCollegeOfExcellenceDocumentUrl(existingData.collegeOfExcellenceDocument || '');
          setSraPrograms(existingData.sraPrograms || '');
          setAiuRecognition(existingData.aiuRecognition || '');
          setAiuDocumentUrl(existingData.aiuDocument || '');
          
          // Populate SRA programs
          if (existingData.sraProgramList && existingData.sraProgramList.length > 0) {
            const sraList = existingData.sraProgramList.map((program: any) => ({
              id: program.id || Date.now().toString(),
              sraType: program.sraType || '',
              document: null,
              documentUrl: program.documentUrl || undefined
            }));
            setSraProgramList(sraList);
          }
        }
      } catch (error) {
        console.error('Error loading existing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, []);

  // Handle checkbox changes
  const handleNatureChange = (nature: keyof NatureSelections) => {
    setNatureSelections(prev => ({
      ...prev,
      [nature]: !prev[nature]
    }))
  }

  // Handle affiliation change
  const handleAffiliationChange = (value: string) => {
    setCollegeAffiliation(value)
  }

  // Generic file validation function
  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file only')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return false
    }
    return true
  }

  // Individual file upload function with better error handling
  const uploadSingleFile = async (file: File, setUrlFunction: (url: string) => void) => {
    try {
      setUploadProgress(`Uploading ${file.name}...`)
      const url = await uploadFileToS3(file)
      if (url) {
        setUrlFunction(url)
        setUploadProgress(`${file.name} uploaded successfully!`)
        setTimeout(() => setUploadProgress(''), 3000)
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert((error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`))
      setUploadProgress('')
    }
  }

  // Handle file removal
  const removeFile = (setFileFunction: (file: File | null) => void, setUrlFunction: (url: string) => void) => {
    setFileFunction(null)
    setUrlFunction('')
  }

  // Handle file upload with immediate upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setAffiliationDocument(file)
      await uploadSingleFile(file, setAffiliationDocumentUrl)
    }
  }

  // Handle UGC document upload with immediate upload
  const handleUgcFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setUgcDocument(file)
      await uploadSingleFile(file, setUgcDocumentUrl)
    }
  }

  // Handle UGC 12B document upload with immediate upload
  const handleUgc12BFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setUgc12BDocument(file)
      await uploadSingleFile(file, setUgc12BDocumentUrl)
    }
  }

  // Handle Autonomous College document upload with immediate upload
  const handleAutonomousCollegeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setAutonomousCollegeDocument(file)
      await uploadSingleFile(file, setAutonomousCollegeDocumentUrl)
    }
  }

  // Handle CPE document upload with immediate upload
  const handleCpeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setCpeDocument(file)
      await uploadSingleFile(file, setCpeDocumentUrl)
    }
  }

  // Handle College of Excellence document upload with immediate upload
  const handleCollegeOfExcellenceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setCollegeOfExcellenceDocument(file)
      await uploadSingleFile(file, setCollegeOfExcellenceDocumentUrl)
    }
  }

  // Handle SRA program document upload with immediate upload
  const handleSRAFileChange = async (programId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      // Update the document first
      setSraProgramList(prev => prev.map(program => 
        program.id === programId 
          ? { ...program, document: file }
          : program
      ))

      // Upload the file
      try {
        setUploadProgress(`Uploading SRA document: ${file.name}...`)
        const url = await uploadFileToS3(file)
        if (url) {
          setSraProgramList(prev => prev.map(program => 
            program.id === programId 
              ? { ...program, documentUrl: url }
              : program
          ))
          setUploadProgress(`SRA document uploaded successfully!`)
          setTimeout(() => setUploadProgress(''), 3000)
        }
      } catch (error) {
        console.error('SRA upload error:', error);
        alert((error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`))
        setUploadProgress('')
      }
    }
  }

  // Handle AIU document upload with immediate upload
  const handleAiuFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setAiuDocument(file)
      await uploadSingleFile(file, setAiuDocumentUrl)
    }
  }

  // Remove SRA program document
  const removeSRADocument = (programId: string) => {
    setSraProgramList(prev => prev.map(program => 
      program.id === programId 
        ? { ...program, document: null, documentUrl: undefined }
        : program
    ))
  }

  // Add new SRA program
  const addSRAProgram = () => {
    const newProgram: SRAProgram = {
      id: Date.now().toString(),
      sraType: '',
      document: null
    }
    setSraProgramList(prev => [...prev, newProgram])
  }

  // Remove SRA program
  const removeSRAProgram = (programId: string) => {
    setSraProgramList(prev => prev.filter(program => program.id !== programId))
  }

  // Update SRA program type
  const updateSRAProgramType = (programId: string, sraType: string) => {
    setSraProgramList(prev => prev.map(program => 
      program.id === programId 
        ? { ...program, sraType }
        : program
    ))
  }

  // Prepare form data with uploaded URLs
  const prepareFormData = (): AffiliationFormData => {
    const selectedNatures = Object.entries(natureSelections)
      .filter(([_, isSelected]) => isSelected)
      .map(([key, _]) => key)

    const updatedSraProgramList = sraProgramList.map(program => ({
      id: program.id,
      sraType: program.sraType,
      documentUrl: program.documentUrl || null
    }))

    return {
      natureOfCollege: selectedNatures,
      collegeAffiliation: collegeAffiliation,
      universityName: universityName,
      universityState: universityState,
      affiliationDocument: affiliationDocumentUrl || null,
      ugcRecognition: ugcRecognition,
      ugcDocument: ugcDocumentUrl || null,
      ugc12BRecognition: ugc12BRecognition,
      ugc12BDocument: ugc12BDocumentUrl || null,
      autonomousCollege: autonomousCollege,
      autonomousCollegeDocument: autonomousCollegeDocumentUrl || null,
      cpeRecognition: cpeRecognition,
      cpeDocument: cpeDocumentUrl || null,
      collegeOfExcellence: collegeOfExcellence,
      collegeOfExcellenceDocument: collegeOfExcellenceDocumentUrl || null,
      sraPrograms: sraPrograms,
      sraProgramList: updatedSraProgramList,
      aiuRecognition: aiuRecognition,
      aiuDocument: aiuDocumentUrl || null,
      id: "CPT2"
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      setUploadProgress('Submitting form data...')
      
      const formData = prepareFormData()
      
      // Get JWT token from localStorage or wherever you store it
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      // Submit to your API
      const response = await axios.post(
        'https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/answers',
        {
          questionId: "iiqa2",
          answer: formData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      )
      
      if (response.data.message === "Answer saved") {
        setUploadProgress('Form submitted successfully!')
        alert('Affiliation details saved successfully!')
      } else {
        throw new Error('Unexpected response from server')
      }
      
    } catch (error) {
      console.error('Error saving affiliation details:', error)
      let errorMessage = 'An unknown error occurred';
      
      if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as any;
        errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`)
      setUploadProgress('')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setUploadProgress(''), 3000)
    }
  }

  // View file function
  const viewFile = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // File control component for consistent UI
  const FileControl = ({ 
    documentUrl, 
    document, 
    onRemove, 
    documentName = "Document" 
  }: { 
    documentUrl: string, 
    document: File | null, 
    onRemove: () => void,
    documentName?: string
  }) => (
    (document || documentUrl) ? (
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-green-600">
          {document ? `Selected: ${document.name}` : `${documentName} uploaded`}
        </p>
        {documentUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => viewFile(documentUrl)}
            className="text-xs px-2 py-1 h-6"
          >
            View
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700"
        >
          Remove
        </Button>
      </div>
    ) : null
  )

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto max-h-[80vh] flex items-center justify-center">
        <p className="text-lg">Loading form data...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto max-h-[80vh] flex flex-col">
      <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Upload Progress Indicator */}
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">{uploadProgress}</p>
          </div>
        )}
        
        {/* Nature of College Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Nature of the college
          </Label>
          <div className="flex flex-row gap-8 w-96">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="private" 
                checked={natureSelections.private}
                onCheckedChange={() => handleNatureChange('private')}
              />
              <Label htmlFor="private" className="text-sm whitespace-nowrap">Private</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="government" 
                checked={natureSelections.government}
                onCheckedChange={() => handleNatureChange('government')}
              />
              <Label htmlFor="government" className="text-sm whitespace-nowrap">Government</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="selfFinancing" 
                checked={natureSelections.selfFinancing}
                onCheckedChange={() => handleNatureChange('selfFinancing')}
              />
              <Label htmlFor="selfFinancing" className="text-sm whitespace-nowrap">Self-financing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="grantInAid" 
                checked={natureSelections.grantInAid}
                onCheckedChange={() => handleNatureChange('grantInAid')}
              />
              <Label htmlFor="grantInAid" className="text-sm whitespace-nowrap">Grant-in-aid</Label>
            </div>
          </div>
        </div>

        {/* College Affiliation Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            College Affiliation
          </Label>
          <Select 
            value={collegeAffiliation}
            onValueChange={handleAffiliationChange}
          >
            <SelectTrigger className="w-80 text-sm">
              <SelectValue placeholder="Select affiliation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Affiliated">Affiliated</SelectItem>
              <SelectItem value="Constituted">Constituted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* University Name Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            University Name
          </Label>
          <Input 
            type="text"
            placeholder="Enter university name"
            className="w-80 text-sm"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
          />
        </div>

        {/* University State Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            State
          </Label>
          <Select 
            value={universityState}
            onValueChange={setUniversityState}
          >
            <SelectTrigger className="w-80 text-sm">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {indiaStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Affiliation Document Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Affiliation Document
          </Label>
          <div className="w-80">
            <Input 
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              File type: PDF only (Max. size: 5MB)
            </p>
            <FileControl
              documentUrl={affiliationDocumentUrl}
              document={affiliationDocument}
              onRemove={() => removeFile(setAffiliationDocument, setAffiliationDocumentUrl)}
              documentName="Affiliation Document"
            />
          </div>
        </div>

        {/* UGC Recognition Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Is the Institution recognized under section 2(f) of the UGC Act?
          </Label>
          <div className="w-80">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="ugc-yes"
                  name="ugc-recognition"
                  value="Yes"
                  checked={ugcRecognition === 'Yes'}
                  onChange={(e) => setUgcRecognition(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="ugc-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="ugc-no"
                  name="ugc-recognition"
                  value="No"
                  checked={ugcRecognition === 'No'}
                  onChange={(e) => setUgcRecognition(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="ugc-no" className="text-sm">No</Label>
              </div>
            </div>
            
            {/* Conditional File Upload */}
            {ugcRecognition === 'Yes' && (
              <div className="mt-4">
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleUgcFileChange}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  File type: PDF only (Max. size: 5MB)
                </p>
                <FileControl
                  documentUrl={ugcDocumentUrl}
                  document={ugcDocument}
                  onRemove={() => removeFile(setUgcDocument, setUgcDocumentUrl)}
                  documentName="UGC Document"
                />
              </div>
            )}
          </div>
        </div>

        {/* UGC 12B Recognition Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Is the Institution recognized under section 12B of the UGC Act?
          </Label>
          <div className="w-80">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="ugc12b-yes"
                  name="ugc12b-recognition"
                  value="Yes"
                  checked={ugc12BRecognition === 'Yes'}
                  onChange={(e) => setUgc12BRecognition(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="ugc12b-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="ugc12b-no"
                  name="ugc12b-recognition"
                  value="No"
                  checked={ugc12BRecognition === 'No'}
                  onChange={(e) => setUgc12BRecognition(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="ugc12b-no" className="text-sm">No</Label>
              </div>
            </div>
            
            {/* Conditional File Upload */}
            {ugc12BRecognition === 'Yes' && ( 
              <div className="mt-4">
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleUgc12BFileChange}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  File type: PDF only (Max. size: 5MB)
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Upload: Date of recognition by UGC under section 12B along with latest Plan General Development Grant release letter
                </p>
                <FileControl
                  documentUrl={ugc12BDocumentUrl}
                  document={ugc12BDocument}
                  onRemove={() => removeFile(setUgc12BDocument, setUgc12BDocumentUrl)}
                  documentName="UGC 12B Document"
                />
              </div>
            )}
          </div>
        </div>

        {/* Autonomous College Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Is the institution recognised as an Autonomous College by the UGC?
          </Label>
          <div className="w-80">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="autonomous-yes"
                  name="autonomous-college"
                  value="Yes"
                  checked={autonomousCollege === 'Yes'}
                  onChange={(e) => setAutonomousCollege(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="autonomous-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="autonomous-no"
                  name="autonomous-college"
                  value="No"
                  checked={autonomousCollege === 'No'}
                  onChange={(e) => setAutonomousCollege(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="autonomous-no" className="text-sm">No</Label>
              </div>
            </div>
            
            {/* Conditional File Upload */}
            {autonomousCollege === 'Yes' && (
              <div className="mt-4">
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleAutonomousCollegeFileChange}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  File type: PDF only (Max. size: 5MB)
                </p>
                <FileControl
                  documentUrl={autonomousCollegeDocumentUrl}
                  document={autonomousCollegeDocument}
                  onRemove={() => removeFile(setAutonomousCollegeDocument, setAutonomousCollegeDocumentUrl)}
                  documentName="Autonomous College Document"
                />
              </div>
            )}
          </div>
        </div>

        {/* CPE Recognition Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Is the institution recognised as a 'College with Potential for Excellence (CPE)' by the UGC?
          </Label>
          <div className="w-80">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="cpe-yes"
                  name="cpe-recognition"
                  value="Yes"
                  checked={cpeRecognition === 'Yes'}
                  onChange={(e) => setCpeRecognition(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="cpe-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="cpe-no"
                  name="cpe-recognition"
                  value="No"
                  checked={cpeRecognition === 'No'}
                  onChange={(e) => setCpeRecognition(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="cpe-no" className="text-sm">No</Label>
              </div>
            </div>
            
            {/* Conditional File Upload */}
            {cpeRecognition === 'Yes' && (
              <div className="mt-4">
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleCpeFileChange}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  File type: PDF only (Max. size: 5MB)
                </p>
                <FileControl
                  documentUrl={cpeDocumentUrl}
                  document={cpeDocument}
                  onRemove={() => removeFile(setCpeDocument, setCpeDocumentUrl)}
                  documentName="CPE Document"
                />
              </div>
            )}
          </div>
        </div>

        {/* College of Excellence Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Is the institution recognised as a 'College of Excellence' by the UGC?
          </Label>
          <div className="w-80">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="excellence-yes"
                  name="college-excellence"
                  value="Yes"
                  checked={collegeOfExcellence === 'Yes'}
                  onChange={(e) => setCollegeOfExcellence(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="excellence-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="excellence-no"
                  name="college-excellence"
                  value="No"
                  checked={collegeOfExcellence === 'No'}
                  onChange={(e) => setCollegeOfExcellence(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="excellence-no" className="text-sm">No</Label>
              </div>
            </div>
            
            {/* Conditional File Upload */}
            {collegeOfExcellence === 'Yes' && (
              <div className="mt-4">
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleCollegeOfExcellenceFileChange}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  File type: PDF only (Max. size: 5MB)
                </p>
                <FileControl
                  documentUrl={collegeOfExcellenceDocumentUrl}
                  document={collegeOfExcellenceDocument}
                  onRemove={() => removeFile(setCollegeOfExcellenceDocument, setCollegeOfExcellenceDocumentUrl)}
                  documentName="College of Excellence Document"
                />
              </div>
            )}
          </div>
        </div>

        {/* SRA Programs Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            Is the College offering any programmes recognised by any Statutory Regulatory Authority (SRA)?
          </Label>
          <div className="w-80">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="sra-yes"
                  name="sra-programs"
                  value="Yes"
                  checked={sraPrograms === 'Yes'}
                  onChange={(e) => {
                    setSraPrograms(e.target.value)
                    if (e.target.value === 'Yes' && sraProgramList.length === 0) {
                      addSRAProgram()
                    }
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="sra-yes" className="text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="sra-no"
                  name="sra-programs"
                  value="No"
                  checked={sraPrograms === 'No'}
                  onChange={(e) => setSraPrograms(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="sra-no" className="text-sm">No</Label>
              </div>
            </div>

            {/* Conditional SRA Program Fields */}
            {sraPrograms === 'Yes' && (
              <div className="mt-4 space-y-4">
                {sraProgramList.map((program, index) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium">SRA Program {index + 1}</h4>
                      {sraProgramList.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSRAProgram(program.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {/* SRA Type Selection */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <Label className="text-sm font-medium w-32">
                          SRA Type
                        </Label>
                        <Select 
                          value={program.sraType}
                          onValueChange={(value) => updateSRAProgramType(program.id, value)}
                        >
                          <SelectTrigger className="w-64 text-sm">
                            <SelectValue placeholder="Select SRA type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UGC">UGC</SelectItem>
                            <SelectItem value="NCTE">NCTE</SelectItem>
                            <SelectItem value="AICTE">AICTE</SelectItem>
                            <SelectItem value="PCI">PCI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Document Upload */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <Label className="text-sm font-medium w-32">
                          Document
                        </Label>
                        <div className="w-64">
                          <Input 
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleSRAFileChange(program.id, e)}
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            File type: PDF only (Max. size: 5MB)
                          </p>
                          <FileControl
                            documentUrl={program.documentUrl || ''}
                            document={program.document}
                            onRemove={() => removeSRADocument(program.id)}
                            documentName={`SRA ${program.sraType} Document`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add More Button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSRAProgram}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Add More SRA Program
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AIU Recognition Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Label className="text-sm font-medium w-40">
            If the institution is not affiliated to a university and is offering programmes recognized by any Statutory Regulatory Authorities (SRA), are the programmes recognized by Association of Indian Universities(AIU) or other appropriate Government authorities as equivalent to UG / PG Programmes of a University?
          </Label>
          <div className="w-80">
            <div className="space-y-3">
              {/* Text Input */}
              <div>
                <Input 
                  type="text"
                  placeholder="Enter details about AIU recognition"
                  className="w-full text-sm"
                  value={aiuRecognition}
                  onChange={(e) => setAiuRecognition(e.target.value)}
                />
              </div>
              
              {/* File Upload */}
              <div>
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleAiuFileChange}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  File type: PDF only (Max. size: 5MB)
                </p>
                <FileControl
                  documentUrl={aiuDocumentUrl}
                  document={aiuDocument}
                  onRemove={() => removeFile(setAiuDocument, setAiuDocumentUrl)}
                  documentName="AIU Document"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-6 pb-4">
          <Button 
            type="submit" 
            className="px-8 py-2 bg-black text-white hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
}
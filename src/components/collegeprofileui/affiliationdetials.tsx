import React, { useState, useEffect } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Save, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
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

// Error response interface
interface AxiosErrorResponse {
  response?: {
    status: number
    statusText: string
  }
  code?: string
  message?: string
}

// SRA Program from API response
interface APISRAProgram {
  id?: string
  sraType?: string
  documentUrl?: string | null | undefined
}

// S3 Upload utility function - Updated to match the first component's pattern
const uploadFileToS3 = async (file: File, collegeId: string, questionId: string): Promise<string | null> => {
  try {
    console.log('Starting file upload for:', file.name);
    
    const fileName = file.name;
    const fileExtension = fileName
      .substring(fileName.lastIndexOf(".") + 1)
      .toLowerCase();
    
    const response = await axios.post(
      "https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/upload-url",
      { 
        collegeId, 
        questionId, 
        fileExtension 
      },
      {
        timeout: 30000,
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

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        if (typeof progressEvent.total === 'number' && progressEvent.total > 0) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    });

    console.log('File uploaded successfully. File URL:', fileUrl);
    return fileUrl;
  } catch (error: unknown) {
  console.error("S3 upload failed:", error);

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const err = error as { code?: string };
    if (err.code === "ERR_NETWORK") {
      throw new Error(
        `Network error while uploading ${file.name}. Please check your internet connection.`
      );
    }
    if (err.code === "ECONNABORTED") {
      throw new Error(
        `Upload timeout for ${file.name}. Please try again.`
      );
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const err = error as { response: { status: number; statusText: string } };
    throw new Error(
      `Upload failed for ${file.name}: ${err.response.status} ${err.response.statusText}`
    );
  }

  if (error instanceof Error) {
    throw new Error(`Failed to upload ${file.name}: ${error.message}`);
  }

  throw new Error(`Failed to upload ${file.name}: Unknown error`);
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

// Tooltip component
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button 
        type="button" 
        className="inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        aria-label="More information"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 ml-2" />
      </button>
    </TooltipTrigger>
    <TooltipContent>
      <p className="max-w-xs">{content}</p>
    </TooltipContent>
  </Tooltip>
)

// Success Modal Component
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <Button 
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

// Error Modal Component
const ErrorModal = ({ 
  isOpen, 
  onClose, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed</h3>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <Button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [collegeId, setCollegeId] = useState<string>('')
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
        
        // Get collegeId from localStorage
        const storedCollegeId = localStorage.getItem('collegeId');
        if (storedCollegeId) {
          setCollegeId(storedCollegeId);
        }
        
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
            const sraList = existingData.sraProgramList.map((program: APISRAProgram) => ({
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
      setErrorMessage('Please select a PDF file only')
      setShowErrorModal(true)
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5MB')
      setShowErrorModal(true)
      return false
    }
    return true
  }

  // Individual file upload function with updated API call
  const uploadSingleFile = async (file: File, setUrlFunction: (url: string) => void) => {
    try {
      // Check if collegeId is available
      if (!collegeId) {
        setErrorMessage('College ID not found. Please refresh the page and try again.')
        setShowErrorModal(true)
        return
      }

      setUploadProgress(`Uploading ${file.name}...`)
      const url = await uploadFileToS3(file, collegeId, 'iiqa2')
      if (url) {
        setUrlFunction(url)
        setUploadProgress(`${file.name} uploaded successfully!`)
        setTimeout(() => setUploadProgress(''), 3000)
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`
      setErrorMessage(errorMessage)
      setShowErrorModal(true)
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

  // Handle SRA program document upload with updated API call
  const handleSRAFileChange = async (programId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      // Check if collegeId is available
      if (!collegeId) {
        setErrorMessage('College ID not found. Please refresh the page and try again.')
        setShowErrorModal(true)
        return
      }

      // Update the document first
      setSraProgramList(prev => prev.map(program => 
        program.id === programId 
          ? { ...program, document: file }
          : program
      ))

      // Upload the file
      try {
        setUploadProgress(`Uploading SRA document: ${file.name}...`)
        const url = await uploadFileToS3(file, collegeId, 'iiqa2')
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
        const errorMessage = error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`
        setErrorMessage(errorMessage)
        setShowErrorModal(true)
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
        setErrorMessage('Authentication token not found. Please log in again.')
        setShowErrorModal(true)
        return
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
        setModalMessage('Affiliation details saved successfully!')
        setShowSuccessModal(true)
      } else {
        setErrorMessage('Unexpected response from server')
        setShowErrorModal(true)
      }
      
    } catch (error) {
      console.error('Error saving affiliation details:', error)
      let errorMessage = 'An unknown error occurred';
      
      const axiosError = error as AxiosErrorResponse;
      
      if (axiosError.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (axiosError.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (axiosError.response) {
        errorMessage = `Server error: ${axiosError.response.status} ${axiosError.response.statusText}`;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      
      setErrorMessage(errorMessage)
      setShowErrorModal(true)
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

  return (
    <TooltipProvider>
      <div className="w-full max-w-6xl mx-auto h-full flex flex-col relative">

        {/* Success Modal */}
        <SuccessModal 
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={modalMessage}
        />

        {/* Error Modal */}
        <ErrorModal 
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
        />

        <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800">Affiliation Details</h3>
              <InfoTooltip content="Fill in all the affiliation and recognition details of your institution. Upload relevant documents in PDF format." />
            </div>
          </div>
          
          {/* Upload Progress Indicator */}
          {/* {uploadProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">{uploadProgress}</p>
            </div>
          )} */}

          {/* Nature of College Section */}
     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Nature of the college
              </Label>
              <InfoTooltip content="Select all applicable categories that describe the nature and ownership of your institution." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                College Affiliation
              </Label>
              <InfoTooltip content="Specify whether your college is affiliated to or constituted by a university." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                University Name
              </Label>
              <InfoTooltip content="Enter the full name of the university to which your college is affiliated or by which it is constituted." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                State
              </Label>
              <InfoTooltip content="Select the state where the parent university is located." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Affiliation Document
              </Label>
              <InfoTooltip content="Upload the official affiliation/constitution document from the university. PDF format only, maximum 5MB." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Is the Institution recognized under section 2(f) of the UGC Act?
              </Label>
              <InfoTooltip content="Section 2(f) recognition means the institution is recognized by UGC as a university for higher education purposes." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Is the Institution recognized under section 12B of the UGC Act?
              </Label>
              <InfoTooltip content="Section 12B recognition allows the institution to receive central government grants and funding from UGC." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Is the institution recognised as an Autonomous College by the UGC?
              </Label>
              <InfoTooltip content="Autonomous colleges have the freedom to design their own courses, conduct examinations, and declare results within the university framework." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Is the institution recognised as a College with Potential for Excellence CPE by the UGC?
              </Label>
              <InfoTooltip content="CPE is a UGC scheme to support colleges with potential for excellence by providing additional grants and autonomy." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Is the institution recognised as a College of Excellence by the UGC?
              </Label>
              <InfoTooltip content="College of Excellence is a prestigious recognition given by UGC to institutions demonstrating exceptional academic performance." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                Is the College offering any programmes recognised by any Statutory Regulatory Authority (SRA)?
              </Label>
              <InfoTooltip content="Statutory Regulatory Authorities include UGC, AICTE, NCTE, PCI etc. that regulate and approve specific professional programs." />
            </div>
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
            <div className="flex items-center">
              <Label className="text-sm font-medium w-40">
                If the institution is not affiliated to a university and is offering programmes recognized by any Statutory Regulatory Authorities (SRA), are the programmes recognized by Association of Indian Universities(AIU) or other appropriate Government authorities as equivalent to UG / PG Programmes of a University?
              </Label>
              <InfoTooltip content="For non-affiliated institutions, AIU recognition ensures that programs are equivalent to university degree programs for employment and further education." />
            </div>
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
        </form>

        {/* Mobile Save Button */}
        <div className="flex justify-center">
          <div className="lg:hidden mb-4 px-4">
            <Button 
              type="button"
              onClick={handleSubmit}
              className="w-[100px] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
              disabled={isSubmitting}
            >
              <Save className="h-5 w-5" />
              <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
            </Button>
          </div>
        </div>
        
        {/* Desktop Floating Save Button */}
        <div className="hidden lg:block">
          <Button 
            onClick={handleSubmit} 
            className="fixed bottom-7 right-15 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
            disabled={isSubmitting}
          >
            <Save className="h-5 w-5" />
            <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
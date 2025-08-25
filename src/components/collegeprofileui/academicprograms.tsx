import React, { useState, useEffect } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Info, Save } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import axios from 'axios'

// TypeScript interfaces for type safety
interface AcademicProgramsFormData {
  ugPrograms: string
  pgPrograms: string
  postMastersPrograms: string
  preDoctoralPrograms: string
  doctoralPrograms: string
  postDoctoralPrograms: string
  pgDiplomaPrograms: string
  diplomaPrograms: string
  certificatePrograms: string
  programmeDetails: ProgrammeDetail[]
  id: string
}

interface ProgrammeDetail {
  id: string
  program: string
  department: string
  universityAffiliation: string
  sraRecognition: string
  affiliationStatus: string
  document: File | null
  documentUrl?: string
}

// API Response interfaces
interface ApiAnswer {
  questionId: string
  answer: AcademicProgramsFormData
}

interface ApiError {
  response?: {
    status: number
    statusText: string
  }
  code?: string
  message?: string
}

interface ExistingProgrammeDetail {
  id: string
  program: string
  department: string
  universityAffiliation: string
  sraRecognition: string
  affiliationStatus: string
  documentUrl?: string
}

// S3 Upload utility function
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
const fetchExistingData = async (questionId: string): Promise<AcademicProgramsFormData | null> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, starting with empty form');
      return null;
    }

    const response = await axios.get(
      'https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/answers?questionId=iiqa3',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log("GET response:", response.data);
    const allAnswers = response.data as ApiAnswer[];

    const iiqa3Data = allAnswers.find((item: ApiAnswer) => item.questionId === "iiqa3");

    if (iiqa3Data && iiqa3Data.answer) {
      console.log("iiqa3 answer:", iiqa3Data.answer);
      return iiqa3Data.answer;
    } else {
      console.log("No data found for iiqa3");
      return null;
    }
  } catch (error) {
    console.error('Error fetching existing data:', error);
    return null;
  }
};

// Helper to validate integer input between 0 and 100
const validateIntInput = (value: string) => {
  if (value === '') return ''
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) return '0'
  if (num > 100) return '100'
  return String(num)
}

// Tooltip component with better alignment
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

export const Academicprograms = () => {
  // State management for integer inputs
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [collegeId, setCollegeId] = useState<string>('')
  const [ugPrograms, setUgPrograms] = useState('')
  const [pgPrograms, setPgPrograms] = useState('')
  const [postMastersPrograms, setPostMastersPrograms] = useState('')
  const [preDoctoralPrograms, setPreDoctoralPrograms] = useState('')
  const [doctoralPrograms, setDoctoralPrograms] = useState('')
  const [postDoctoralPrograms, setPostDoctoralPrograms] = useState('')
  const [pgDiplomaPrograms, setPgDiplomaPrograms] = useState('')
  const [diplomaPrograms, setDiplomaPrograms] = useState('')
  const [certificatePrograms, setCertificatePrograms] = useState('')

  // State management for programme details table
  const [programmeDetails, setProgrammeDetails] = useState<ProgrammeDetail[]>([])

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
        
        const existingData = await fetchExistingData("iiqa3");
        
        if (existingData) {
          console.log("Loading existing data:", existingData);
          
          // Populate program counts
          setUgPrograms(existingData.ugPrograms || '');
          setPgPrograms(existingData.pgPrograms || '');
          setPostMastersPrograms(existingData.postMastersPrograms || '');
          setPreDoctoralPrograms(existingData.preDoctoralPrograms || '');
          setDoctoralPrograms(existingData.doctoralPrograms || '');
          setPostDoctoralPrograms(existingData.postDoctoralPrograms || '');
          setPgDiplomaPrograms(existingData.pgDiplomaPrograms || '');
          setDiplomaPrograms(existingData.diplomaPrograms || '');
          setCertificatePrograms(existingData.certificatePrograms || '');
          
          // Populate programme details
          if (existingData.programmeDetails && existingData.programmeDetails.length > 0) {
            const programmeList = existingData.programmeDetails.map((programme: ExistingProgrammeDetail) => ({
              id: programme.id || Date.now().toString(),
              program: programme.program || '',
              department: programme.department || '',
              universityAffiliation: programme.universityAffiliation || '',
              sraRecognition: programme.sraRecognition || '',
              affiliationStatus: programme.affiliationStatus || '',
              document: null, // We don't have the actual File objects
              documentUrl: programme.documentUrl || undefined
            }));
            setProgrammeDetails(programmeList);
          } else {
            // Add default row if no existing data
            addProgrammeDetail();
          }
        } else {
          // Add default row for new forms
          addProgrammeDetail();
        }
      } catch (error) {
        console.error('Error loading existing data:', error);
        // Add default row on error
        addProgrammeDetail();
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, []);

  // Add new programme detail row
  const addProgrammeDetail = () => {
    const newProgramme: ProgrammeDetail = {
      id: Date.now().toString(),
      program: '',
      department: '',
      universityAffiliation: '',
      sraRecognition: '',
      affiliationStatus: '',
      document: null
    }
    setProgrammeDetails(prev => [...prev, newProgramme])
  }

  // Remove programme detail row
  const removeProgrammeDetail = (id: string) => {
    if (programmeDetails.length > 1) {
      setProgrammeDetails(prev => prev.filter(item => item.id !== id))
    } else {
      setErrorMessage('At least one programme detail row must remain.')
      setShowErrorModal(true)
    }
  }

  // Update programme detail field
  const updateProgrammeDetail = (id: string, field: keyof ProgrammeDetail, value: string | File | null) => {
    setProgrammeDetails(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // Validate file
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

  // Handle file upload for programme details
  const handleProgrammeFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      // Check if collegeId is available
      if (!collegeId) {
        setErrorMessage('College ID not found. Please refresh the page and try again.')
        setShowErrorModal(true)
        return
      }

      // Update the document first
      updateProgrammeDetail(id, 'document', file)

      // Upload the file
      try {
        setUploadProgress(`Uploading programme document: ${file.name}...`)
        const url = await uploadFileToS3(file, collegeId, 'iiqa3')
        if (url) {
          updateProgrammeDetail(id, 'documentUrl', url)
          setUploadProgress(`Programme document uploaded successfully!`)
          setTimeout(() => setUploadProgress(''), 3000)
        }
      } catch (error) {
        console.error('Programme document upload error:', error);
        const errorMessage = error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`
        setErrorMessage(errorMessage)
        setShowErrorModal(true)
        setUploadProgress('')
      }
    }
  }

  // Remove programme document
  const removeProgrammeDocument = (id: string) => {
    updateProgrammeDetail(id, 'document', null)
    updateProgrammeDetail(id, 'documentUrl', null)
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
    documentUrl?: string, 
    document: File | null, 
    onRemove: () => void,
    documentName?: string
  }) => (
    (document || documentUrl) ? (
      <div className="flex items-center gap-1 mt-1">
        <p className="text-xs text-green-600 flex-1">
          {document ? `Selected: ${document.name}` : `${documentName} uploaded`}
        </p>
        {documentUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => viewFile(documentUrl)}
            className="text-xs px-1 py-0 h-5"
          >
            View
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-xs px-1 py-0 h-5 text-red-600 hover:text-red-700"
        >
          Remove
        </Button>
      </div>
    ) : null
  )

  // Prepare data for backend
  const prepareFormData = (): AcademicProgramsFormData => {
    const updatedProgrammeDetails = programmeDetails.map(programme => ({
      id: programme.id,
      program: programme.program,
      department: programme.department,
      universityAffiliation: programme.universityAffiliation,
      sraRecognition: programme.sraRecognition,
      affiliationStatus: programme.affiliationStatus,
      document: null, // Don't include File objects in API call
      documentUrl: programme.documentUrl || undefined
    }));

    return {
      ugPrograms: ugPrograms,
      pgPrograms: pgPrograms,
      postMastersPrograms: postMastersPrograms,
      preDoctoralPrograms: preDoctoralPrograms,
      doctoralPrograms: doctoralPrograms,
      postDoctoralPrograms: postDoctoralPrograms,
      pgDiplomaPrograms: pgDiplomaPrograms,
      diplomaPrograms: diplomaPrograms,
      certificatePrograms: certificatePrograms,
      programmeDetails: updatedProgrammeDetails,
      id: "CPT3"
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      setUploadProgress('Submitting form data...')
      
      const formData = prepareFormData()
      
      // Get JWT token from localStorage
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
          questionId: "iiqa3",
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
        setModalMessage('Academic programs saved successfully!')
        setShowSuccessModal(true)
      } else {
        setErrorMessage('Unexpected response from server')
        setShowErrorModal(true)
      }
      
    } catch (error) {
      console.error('Error saving academic programs:', error)
      let errorMessage = 'An unknown error occurred';
      
      const apiError = error as ApiError;
      
      if (apiError.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (apiError.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (apiError.response) {
        errorMessage = `Server error: ${apiError.response.status} ${apiError.response.statusText}`;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
      
      setErrorMessage(errorMessage)
      setShowErrorModal(true)
      setUploadProgress('')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setUploadProgress(''), 3000)
    }
  }

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

        <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
          
          {/* Upload Progress Indicator */}
          {uploadProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">{uploadProgress}</p>
            </div>
          )}

          {/* Integer Input Fields Section */}
          <div className="space-y-4">
            {/* Program Counts Header */}
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-800">Program Counts</h3>
                <InfoTooltip content="Enter the number of programs offered by your institution in each category. Numbers should be accurate and current." />
              </div>
            </div>
            
            {/* UG Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  UG Programs
                </Label>
                <InfoTooltip content="Number of undergraduate programs offered by the institution including B.A., B.Sc., B.Com., B.Tech, etc." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of UG programs"
                className="w-80 text-sm"
                value={ugPrograms}
                onChange={(e) => setUgPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* PG Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  PG Programs
                </Label>
                <InfoTooltip content="Number of postgraduate programs offered including M.A., M.Sc., M.Com., M.Tech, MBA, etc." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of PG programs"
                className="w-80 text-sm"
                value={pgPrograms}
                onChange={(e) => setPgPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* Post Master's Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  Post Masters DM, Ayurveda Vachaspathi MCh
                </Label>
                <InfoTooltip content="Number of post-master's specialized programs like Doctor of Medicine (DM), Master of Chirurgiae (M.Ch), etc." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of Post Master's programs"
                className="w-80 text-sm"
                value={postMastersPrograms}
                onChange={(e) => setPostMastersPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* Pre Doctoral Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  Pre Doctoral (M.Phil)
                </Label>
                <InfoTooltip content="Number of Master of Philosophy (M.Phil) programs offered as preparation for doctoral studies." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of Pre Doctoral programs"
                className="w-80 text-sm"
                value={preDoctoralPrograms}
                onChange={(e) => setPreDoctoralPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* Doctoral Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  Doctoral (Ph.D)
                </Label>
                <InfoTooltip content="Number of Doctor of Philosophy (Ph.D) programs offered across various disciplines." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of Doctoral programs"
                className="w-80 text-sm"
                value={doctoralPrograms}
                onChange={(e) => setDoctoralPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* Post Doctoral Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  Post Doctoral (D.Sc, D.Litt, LED)
                </Label>
                <InfoTooltip content="Number of post-doctoral programs like Doctor of Science (D.Sc), Doctor of Literature (D.Litt), etc." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of Post Doctoral programs"
                className="w-80 text-sm"
                value={postDoctoralPrograms}
                onChange={(e) => setPostDoctoralPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* PG Diploma Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  PG Diploma recognised by statutory authority including university
                </Label>
                <InfoTooltip content="Number of postgraduate diploma programs recognized by statutory authorities like UGC, AICTE, etc." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of PG Diploma programs"
                className="w-80 text-sm"
                value={pgDiplomaPrograms}
                onChange={(e) => setPgDiplomaPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* Diploma Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  Diploma
                </Label>
                <InfoTooltip content="Number of diploma programs offered in various technical and non-technical fields." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of Diploma programs"
                className="w-80 text-sm"
                value={diplomaPrograms}
                onChange={(e) => setDiplomaPrograms(validateIntInput(e.target.value))}
              />
            </div>

            {/* Certificate Programs Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-40">
                  Certificate / Awareness
                </Label>
                <InfoTooltip content="Number of certificate and awareness programs offered for skill development and continuing education." />
              </div>
              <Input 
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Enter number of Certificate/Awareness programs"
                className="w-80 text-sm"
                value={certificatePrograms}
                onChange={(e) => setCertificatePrograms(validateIntInput(e.target.value))}
              />
            </div>
          </div>

          {/* Programme Details Table Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Programme Details (Table as below)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        Program
                        <InfoTooltip content="Name of the academic program/course offered" />
                      </div>
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        Department
                        <InfoTooltip content="Department or school offering this program" />
                      </div>
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        University Affiliation
                        <InfoTooltip content="University to which this program is affiliated" />
                      </div>
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        SRA Recognition
                        <InfoTooltip content="Statutory Regulatory Authority that recognizes this program" />
                      </div>
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        Affiliation Status
                        <InfoTooltip content="Whether the program has temporary or permanent affiliation status" />
                      </div>
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        Upload
                        <InfoTooltip content="Upload supporting documents for program recognition/affiliation" />
                      </div>
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {programmeDetails.map((programme, index) => (
                    <tr key={programme.id} className="border-b border-gray-200">
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="text"
                          placeholder="Enter program name"
                          className="w-full text-sm"
                          value={programme.program}
                          onChange={(e) => updateProgrammeDetail(programme.id, 'program', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="text"
                          placeholder="Enter department"
                          className="w-full text-sm"
                          value={programme.department}
                          onChange={(e) => updateProgrammeDetail(programme.id, 'department', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="text"
                          placeholder="Enter university affiliation"
                          className="w-full text-sm"
                          value={programme.universityAffiliation}
                          onChange={(e) => updateProgrammeDetail(programme.id, 'universityAffiliation', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Select
                          value={programme.sraRecognition}
                          onValueChange={(value) => updateProgrammeDetail(programme.id, 'sraRecognition', value)}
                        >
                          <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Select SRA" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UGC">UGC</SelectItem>
                            <SelectItem value="NCTE">NCTE</SelectItem>
                            <SelectItem value="AICTE">AICTE</SelectItem>
                            <SelectItem value="PCI">PCI</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id={`temporary-${programme.id}`}
                              name={`affiliation-${programme.id}`}
                              value="Temporary"
                              checked={programme.affiliationStatus === 'Temporary'}
                              onChange={(e) => updateProgrammeDetail(programme.id, 'affiliationStatus', e.target.value)}
                              className="w-3 h-3 text-blue-600"
                            />
                            <Label htmlFor={`temporary-${programme.id}`} className="text-xs">Temporary</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id={`permanent-${programme.id}`}
                              name={`affiliation-${programme.id}`}
                              value="Permanent"
                              checked={programme.affiliationStatus === 'Permanent'}
                              onChange={(e) => updateProgrammeDetail(programme.id, 'affiliationStatus', e.target.value)}
                              className="w-3 h-3 text-blue-600"
                            />
                            <Label htmlFor={`permanent-${programme.id}`} className="text-xs">Permanent</Label>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="space-y-1">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleProgrammeFileChange(programme.id, e)}
                            className="w-full text-xs"
                          />
                          <p className="text-xs text-gray-500">
                            PDF only (5MB Max.)
                          </p>
                          <FileControl
                            documentUrl={programme.documentUrl}
                            document={programme.document}
                            onRemove={() => removeProgrammeDocument(programme.id)}
                            documentName="Programme Document"
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProgrammeDetail(programme.id)}
                          className="text-red-600 hover:text-red-700 text-xs"
                          disabled={programmeDetails.length === 1}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={7} className="border border-gray-300 px-3 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addProgrammeDetail}
                        className="w-full text-blue-600 hover:text-blue-700"
                      >
                        Add More Programme Detail
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
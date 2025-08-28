import React, { useState, useEffect } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Save } from "lucide-react"
import {TooltipProvider} from "@/components/ui/tooltip"
import InfoTooltip from "@/components/customui/InfoTooltip"
import axios from 'axios'
import { uploadFileToS3 } from '../../utils/uploadFileToS3'
import { Universityandcollegedata } from '@/app/data/universityandcollegedata'

import SuccessModal from "@/components/customui/SuccessModal"
import ErrorModal from "@/components/customui/ErrorModal"
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
  universityState: string
  universityAffiliation: string
  sraRecognition: string
  affiliationStatus: string
  document: File | null
  documentUrl?: string
}

interface UniversityData {
  name: string
  location: string
  type: string
  established: string
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
  universityState: string
  universityAffiliation: string
  sraRecognition: string
  affiliationStatus: string
  documentUrl?: string
}

// Component Props interface
interface AcademicProgramsProps {
  data?: ApiAnswer | null,
   onDataUpdate?: () => void;
}

// Helper to validate integer input between 0 and 100
const validateIntInput = (value: string) => {
  if (value === '') return ''
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) return '0'
  if (num > 100) return '100'
  return String(num)
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (text: string) => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const Academicprograms = ({ data,onDataUpdate }: AcademicProgramsProps) => {
  // State management for integer inputs
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [collegeId, setCollegeId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false) // Track file upload state
  const [ugPrograms, setUgPrograms] = useState('')
  const [pgPrograms, setPgPrograms] = useState('')
  const [postMastersPrograms, setPostMastersPrograms] = useState('')
  const [preDoctoralPrograms, setPreDoctoralPrograms] = useState('')
  const [doctoralPrograms, setDoctoralPrograms] = useState('')
  const [postDoctoralPrograms, setPostDoctoralPrograms] = useState('')
  const [pgDiplomaPrograms, setPgDiplomaPrograms] = useState('')
  const [diplomaPrograms, setDiplomaPrograms] = useState('')
  const [certificatePrograms, setCertificatePrograms] = useState('')
  const [uploadingCount, setUploadingCount] = useState(0) 

  // State management for programme details table
  const [programmeDetails, setProgrammeDetails] = useState<ProgrammeDetail[]>([])
  
  // State for university data
  const [availableUniversitiesByState, setAvailableUniversitiesByState] = useState<{[key: string]: UniversityData[]}>({})

  // Get available states from your data
  const availableStates = Object.keys(Universityandcollegedata).sort()

  // Load data from props when component mounts or data changes
  useEffect(() => {
    const loadDataFromProps = () => {
      try {
        // Get collegeId from localStorage
        const storedCollegeId = localStorage.getItem('collegeId');
        if (storedCollegeId) {
          setCollegeId(storedCollegeId);
        }
        
        // Check if data exists and is for the correct questionId (iiqa3)
        if (data && data.questionId === "iiqa3" && data.answer) {
          console.log("Loading data from props:", data.answer);
          
          const existingData = data.answer;
          
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
              universityState: programme.universityState || '',
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
          // Add default row for new forms or when no data
          addProgrammeDetail();
        }
      } catch (error) {
        console.error('Error loading data from props:', error);
        // Add default row on error
        addProgrammeDetail();
      }
    };

    loadDataFromProps();
  }, [data]); // Dependency on data prop

  // Initialize available universities for each state
  useEffect(() => {
    const universitiesByState: {[key: string]: UniversityData[]} = {};
    availableStates.forEach(state => {
      universitiesByState[state] = Universityandcollegedata[state as keyof typeof Universityandcollegedata] || [];
    });
    setAvailableUniversitiesByState(universitiesByState);
  }, []);

  // Add new programme detail row
  const addProgrammeDetail = () => {
    const newProgramme: ProgrammeDetail = {
      id: Date.now().toString(),
      program: '',
      department: '',
      universityState: '',
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

  // Update programme detail field with capitalization for text fields
  const handleTextOnlyInput = (value: string) => {
  // Only allow letters, spaces, and basic punctuation
  const textOnlyValue = value.replace(/[^a-zA-Z\s\.,\-\(\)]/g, '');
  return capitalizeFirstLetter(textOnlyValue);
};
  const updateProgrammeDetail = (id: string, field: keyof ProgrammeDetail, value: string | File | null) => {
  let processedValue = value;
  
  // Apply text-only validation and capitalization for program and department fields
  if (typeof value === 'string' && (field === 'program' || field === 'department')) {
    processedValue = handleTextOnlyInput(value);
  }
  
  setProgrammeDetails(prev => prev.map(item => 
    item.id === id ? { ...item, [field]: processedValue } : item
  ))
}
  // Handle state change for programme details
  const handleProgrammeStateChange = (id: string, state: string) => {
    setProgrammeDetails(prev => prev.map(item => 
      item.id === id 
        ? { ...item, universityState: state, universityAffiliation: '' } // Clear university when state changes
        : item
    ))
  }

  // Get available universities for a specific state
  const getAvailableUniversitiesForState = (state: string): UniversityData[] => {
    return availableUniversitiesByState[state] || [];
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
      setIsUploading(true) // Start upload
      setUploadingCount(prev => prev + 1) // Increment upload counter
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
    } finally {
      setUploadingCount(prev => prev - 1) // Decrement upload counter
      // Only set isUploading to false when no more uploads are in progress
      setUploadingCount(prev => {
        if (prev <= 1) {
          setIsUploading(false)
        }
        return Math.max(0, prev - 1)
      })
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

  //file control component
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
  }) => {
    // Function to truncate file name if too long
    const truncateFileName = (fileName: string, maxLength: number = 30) => {
      if (fileName.length <= maxLength) return fileName;
      const extension = fileName.split('.').pop();
      const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
      const truncatedName = nameWithoutExtension.substring(0, maxLength - extension!.length - 4) + '...';
      return `${truncatedName}.${extension}`;
    };

    return (
      (document || documentUrl) ? (
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <p className="text-xs text-green-600 flex-shrink min-w-0">
            {document 
              ? `Selected: ${truncateFileName(document.name)}` 
              : `${documentName} uploaded`
            }
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>
      ) : null
    )
  }

  // Prepare data for backend
  const prepareFormData = (): AcademicProgramsFormData => {
    const updatedProgrammeDetails = programmeDetails.map(programme => ({
      id: programme.id,
      program: programme.program,
      department: programme.department,
      universityState: programme.universityState,
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
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/answers`,
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
        if (onDataUpdate) {
  onDataUpdate();
}
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
    <div className="w-full max-w-full mx-auto h-full flex flex-col relative overflow-hidden">

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
      
      {/* Main Form Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 pb-24">
        <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-6">

          {/* Program Counts Section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Section Header */}
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Program Counts</h3>
              <InfoTooltip content="Enter the number of programs offered by your institution in each category. Numbers should be accurate and current." />
            </div>
            
            {/* Program Input Fields - Mobile Optimized */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              
              {/* UG Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">UG Programs</Label>
                  <InfoTooltip content="Number of undergraduate programs offered by the institution including B.A., B.Sc., B.Com., B.Tech, etc." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of UG programs"
                  className="w-full text-sm"
                  value={ugPrograms}
                  onChange={(e) => setUgPrograms(validateIntInput(e.target.value))}
                />
              </div>

              {/* PG Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">PG Programs</Label>
                  <InfoTooltip content="Number of postgraduate programs offered including M.A., M.Sc., M.Com., M.Tech, MBA, etc." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of PG programs"
                  className="w-full text-sm"
                  value={pgPrograms}
                  onChange={(e) => setPgPrograms(validateIntInput(e.target.value))}
                />
              </div>

              {/* Post Master's Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">Post Masters DM, Ayurveda Vachaspathi MCh</Label>
                  <InfoTooltip content="Number of post-master's specialized programs like Doctor of Medicine (DM), Master of Chirurgiae (M.Ch), etc." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of Post Master's programs"
                  className="w-full text-sm"
                  value={postMastersPrograms}
                  onChange={(e) => setPostMastersPrograms(validateIntInput(e.target.value))}
                />
              </div>

              {/* Pre Doctoral Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">Pre Doctoral (M.Phil)</Label>
                  <InfoTooltip content="Number of Master of Philosophy (M.Phil) programs offered as preparation for doctoral studies." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of Pre Doctoral programs"
                  className="w-full text-sm"
                  value={preDoctoralPrograms}
                  onChange={(e) => setPreDoctoralPrograms(validateIntInput(e.target.value))}
                />
              </div>

              {/* Doctoral Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">Doctoral (Ph.D)</Label>
                  <InfoTooltip content="Number of Doctor of Philosophy (Ph.D) programs offered across various disciplines." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of Doctoral programs"
                  className="w-full text-sm"
                  value={doctoralPrograms}
                  onChange={(e) => setDoctoralPrograms(validateIntInput(e.target.value))}
                />
              </div>

              {/* Post Doctoral Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">Post Doctoral (D.Sc, D.Litt, LED)</Label>
                  <InfoTooltip content="Number of post-doctoral programs like Doctor of Science (D.Sc), Doctor of Literature (D.Litt), etc." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of Post Doctoral programs"
                  className="w-full text-sm"
                  value={postDoctoralPrograms}
                  onChange={(e) => setPostDoctoralPrograms(validateIntInput(e.target.value))}
                />
              </div>

              {/* PG Diploma Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">PG Diploma recognised by statutory authority</Label>
                  <InfoTooltip content="Number of postgraduate diploma programs recognized by statutory authorities like UGC, AICTE, etc." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of PG Diploma programs"
                  className="w-full text-sm"
                  value={pgDiplomaPrograms}
                  onChange={(e) => setPgDiplomaPrograms(validateIntInput(e.target.value))}
                />
              </div>

              {/* Diploma Programs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">Diploma</Label>
                  <InfoTooltip content="Number of diploma programs offered in various technical and non-technical fields." />
                </div>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="Enter number of Diploma programs"
                  className="w-full text-sm"
                  value={diplomaPrograms}
                  onChange={(e) => setDiplomaPrograms(validateIntInput(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Programme Details Section */}
          <div className="space-y-4 pt-4 sm:pt-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Programme Details</h3>
              <InfoTooltip content="Add detailed information for each academic program offered" />
            </div>
            
            {/* Mobile: Card Layout, Desktop: Table Layout */}
            <div className="space-y-4">
              {/* Mobile View - Card Layout */}
              <div className="block lg:hidden space-y-4">
                {programmeDetails.map((programme, index) => (
                  <div key={programme.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm">
                    {/* Card Header with Remove Button */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Program {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProgrammeDetail(programme.id)}
                        className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                        disabled={programmeDetails.length === 1}
                      >
                    
                      </Button>
                    </div>

                    {/* Program Name */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600">Program Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter program name"
                        className="w-full text-sm"
                        value={programme.program}
                        onChange={(e) => updateProgrammeDetail(programme.id, 'program', e.target.value)}
                      />
                    </div>

                    {/* Department */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600">Department</Label>
                      <Input
                        type="text"
                        placeholder="Enter department name"
                        className="w-full text-sm"
                        value={programme.department}
                        onChange={(e) => updateProgrammeDetail(programme.id, 'department', e.target.value)}
                      />
                    </div>

                    {/* State and University - Two Columns on Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600">State</Label>
                        <Select
                          value={programme.universityState}
                          onValueChange={(value) => handleProgrammeStateChange(programme.id, value)}
                        >
                          <SelectTrigger className="w-full text-sm h-10">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600">University</Label>
                        <Select
                          value={programme.universityAffiliation}
                          onValueChange={(value) => updateProgrammeDetail(programme.id, 'universityAffiliation', value)}
                          disabled={!programme.universityState || getAvailableUniversitiesForState(programme.universityState).length === 0}
                        >
                          <SelectTrigger className="w-full text-sm h-10">
                            <SelectValue 
                              placeholder={
                                !programme.universityState 
                                  ? "Select state first" 
                                  : getAvailableUniversitiesForState(programme.universityState).length === 0 
                                    ? "No universities" 
                                    : "Select university"
                              } 
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableUniversitiesForState(programme.universityState).map((university) => (
                              <SelectItem key={university.name} value={university.name}>
                                {university.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* SRA Recognition */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600">SRA Recognition</Label>
                      <Select
                        value={programme.sraRecognition}
                        onValueChange={(value) => updateProgrammeDetail(programme.id, 'sraRecognition', value)}
                      >
                        <SelectTrigger className="w-full text-sm h-10">
                          <SelectValue placeholder="Select SRA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UGC">UGC</SelectItem>
                          <SelectItem value="NCTE">NCTE</SelectItem>
                          <SelectItem value="AICTE">AICTE</SelectItem>
                          <SelectItem value="PCI">PCI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Affiliation Status */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">Affiliation Status</Label>
                      <div className="flex flex-row space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`temporary-${programme.id}`}
                            name={`affiliation-${programme.id}`}
                            value="Temporary"
                            checked={programme.affiliationStatus === 'Temporary'}
                            onChange={(e) => updateProgrammeDetail(programme.id, 'affiliationStatus', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor={`temporary-${programme.id}`} className="text-sm">Temporary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`permanent-${programme.id}`}
                            name={`affiliation-${programme.id}`}
                            value="Permanent"
                            checked={programme.affiliationStatus === 'Permanent'}
                            onChange={(e) => updateProgrammeDetail(programme.id, 'affiliationStatus', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor={`permanent-${programme.id}`} className="text-sm">Permanent</Label>
                        </div>
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">Upload Document</Label>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleProgrammeFileChange(programme.id, e)}
                        className="w-full text-xs"
                      />
                      <p className="text-xs text-gray-500">PDF only (5MB Max.)</p>
                      <FileControl
                        documentUrl={programme.documentUrl ?? ""}
                        document={programme.document}
                        onRemove={() => removeProgrammeDocument(programme.id)}
                        documentName="Programme Document"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Add More Button - Mobile */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addProgrammeDetail}
                  className="w-full text-blue-600 hover:text-blue-700 border-2 border-dashed border-blue-300 hover:border-blue-400 py-3"
                >
               
                  Add More Programme Detail
                </Button>
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden lg:block overflow-x">
                <table className="w-full border border-gray-300 bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[150px]">
                        <div className="flex items-center">
                          Program
                          <InfoTooltip content="Name of the academic program/course offered" />
                        </div>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[150px]">
                        <div className="flex items-center">
                          Department
                          <InfoTooltip content="Department or school offering this program" />
                        </div>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[120px]">
                        <div className="flex items-center">
                          State
                          <InfoTooltip content="State where the affiliated university is located" />
                        </div>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[200px]">
                        <div className="flex items-center">
                          University
                          <InfoTooltip content="University to which this program is affiliated" />
                        </div>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[100px]">
                        <div className="flex items-center">
                          SRA
                          <InfoTooltip content="Statutory Regulatory Authority that recognizes this program" />
                        </div>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[140px]">
                        <div className="flex items-center">
                          Status
                          <InfoTooltip content="Whether the program has temporary or permanent affiliation status" />
                        </div>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[150px]">
                        <div className="flex items-center">
                          Upload
                          <InfoTooltip content="Upload supporting documents for program recognition/affiliation" />
                        </div>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 min-w-[80px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programmeDetails.map((programme, index) => (
                      <tr key={programme.id} className="border-b border-gray-200">
                        <td className="border border-gray-300 px-3 py-2">
                          <Input
                            type="text"
                            placeholder="Program name"
                            className="w-full text-sm min-w-[140px]"
                            value={programme.program}
                            onChange={(e) => updateProgrammeDetail(programme.id, 'program', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Input
                            type="text"
                            placeholder="Department name"
                            className="w-full text-sm min-w-[140px]"
                            value={programme.department}
                            onChange={(e) => updateProgrammeDetail(programme.id, 'department', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Select
                            value={programme.universityState}
                            onValueChange={(value) => handleProgrammeStateChange(programme.id, value)}
                          >
                            <SelectTrigger className="w-full text-sm min-w-[110px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Select
                            value={programme.universityAffiliation}
                            onValueChange={(value) => updateProgrammeDetail(programme.id, 'universityAffiliation', value)}
                            disabled={!programme.universityState}
                          >
                            <SelectTrigger className="w-full text-sm min-w-[180px]">
                              <SelectValue placeholder="Select university" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableUniversitiesForState(programme.universityState).map((university) => (
                                <SelectItem key={university.name} value={university.name}>
                                  {university.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Select
                            value={programme.sraRecognition}
                            onValueChange={(value) => updateProgrammeDetail(programme.id, 'sraRecognition', value)}
                          >
                            <SelectTrigger className="w-full text-sm min-w-[90px]">
                              <SelectValue placeholder="Select" />
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
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-1">
                              <input
                                type="radio"
                                id={`temp-${programme.id}`}
                                name={`affiliation-${programme.id}`}
                                value="Temporary"
                                checked={programme.affiliationStatus === 'Temporary'}
                                onChange={(e) => updateProgrammeDetail(programme.id, 'affiliationStatus', e.target.value)}
                                className="w-3 h-3"
                              />
                              <Label htmlFor={`temp-${programme.id}`} className="text-xs">Temp</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="radio"
                                id={`perm-${programme.id}`}
                                name={`affiliation-${programme.id}`}
                                value="Permanent"
                                checked={programme.affiliationStatus === 'Permanent'}
                                onChange={(e) => updateProgrammeDetail(programme.id, 'affiliationStatus', e.target.value)}
                                className="w-3 h-3"
                              />
                              <Label htmlFor={`perm-${programme.id}`} className="text-xs">Perm</Label>
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
                            <p className="text-xs text-gray-500">PDF (5MB)</p>
                            <FileControl
                              documentUrl={programme.documentUrl ?? ""}
                              document={programme.document}
                              onRemove={() => removeProgrammeDocument(programme.id)}
                              documentName="Doc"
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProgrammeDetail(programme.id)}
                            className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                            disabled={programmeDetails.length === 1}
                          >
                           Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={8} className="border border-gray-300 px-3 py-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addProgrammeDetail}
                          className="w-full text-blue-600 hover:text-blue-700 border-dashed"
                        >
                        
                          Add More Programme Detail
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">
            {isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : 'Save'}
          </span>
        </Button>
      </div>

      {/* Upload Progress Display */}
      {uploadProgress && (
        <div className="fixed bottom-20 right-4 bg-blue-100 border border-blue-300 text-blue-700 px-3 py-2 rounded-lg shadow-md z-40 max-w-xs">
          <p className="text-xs sm:text-sm">{uploadProgress}</p>
        </div>
      )}
    </div>
  </TooltipProvider>
)
}
import React, { useState, useEffect } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Calendar } from "@/components/ui/calendar"
import { ChevronDownIcon, Save } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import axios from 'axios'
import {
 
  TooltipProvider,
} from "@/components/ui/tooltip"
import { uploadFileToS3 } from '../../utils/uploadFileToS3'
import InfoTooltip from "@/components/customui/InfoTooltip"

import SuccessModal from '../customui/SuccessModal'

import ErrorModal from "@/components/customui/ErrorModal"
// TypeScript interfaces for type safety
interface StaffCounts {
  male: string
  female: string
  transgender: string
  total: string
}

interface StudentCounts {
  male: string
  female: string
  transgender: string
  total: string
}

interface StatutoryCommittees {
  scStCommittee: boolean
  minorityCell: boolean
  grievanceRedressalCommittee: boolean
  internalComplaintsCommittee: boolean
  obcCell: boolean
}

interface QualityInformationFormData {
  teachingStaff: StaffCounts
  nonTeachingStaff: StaffCounts
  studentsOnRoll: StudentCounts
  statutoryCommittees: StatutoryCommittees
  iqacEstablishmentDate: string
  rtiDeclaration: string
  rtiDeclarationUrl: string
  academicMou: string
  academicMouDocument: File | null
  academicMouDocumentUrl?: string
  aisheUploadDate: string
  certificationDocument: File | null
  certificationDocumentUrl?: string
  id: string
}

// Props interface for the component
interface QualityinformationProps {
 data?: { answer: QualityInformationFormData } | null;
   onDataUpdate?: () => void;
}

// Date formatting utilities
const formatDate = (date: Date | undefined): string => {
  if (!date) return ""
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const parseDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined
  
  let day: number, month: number, year: number;
  
  // Handle both dd-mm-yyyy and yyyy-mm-dd formats
  if (dateString.includes('-')) {
    const parts = dateString.split("-")
    if (parts[0].length === 4) {
      // yyyy-mm-dd format
      year = Number(parts[0])
      month = Number(parts[1])
      day = Number(parts[2])
    } else {
      // dd-mm-yyyy format
      day = Number(parts[0])
      month = Number(parts[1])
      year = Number(parts[2])
    }
  } else {
    return undefined
  }
  
  // Create date at noon to avoid timezone issues
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  return isNaN(date.getTime()) ? undefined : date
}

const dateToApiFormat = (date: Date | undefined): string => {
  if (!date) return ''
  // Create a new date at noon to avoid timezone issues
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
  return normalizedDate.toISOString().split('T')[0]
}





// Helper to validate integer input
const validateIntInput = (value: string) => {
  if (value === '') return ''
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) return '0'
  return String(num)
}

// Helper to calculate total
const calculateTotal = (male: string, female: string, transgender: string) => {
  const maleNum = Number(male) || 0
  const femaleNum = Number(female) || 0
  const transgenderNum = Number(transgender) || 0
  return String(maleNum + femaleNum + transgenderNum)
}

// Tooltip component with better alignment

export const Qualityinformation: React.FC<QualityinformationProps> = ({ data ,onDataUpdate}) => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false) // Track file upload state
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [collegeId, setCollegeId] = useState<string>('')
  
  // Date popover states
  const [iqacDateOpen, setIqacDateOpen] = useState(false)
  const [aisheDateOpen, setAisheDateOpen] = useState(false)
  const [iqacDate, setIqacDate] = useState<Date | undefined>(undefined)
  const [aisheDate, setAisheDate] = useState<Date | undefined>(undefined)
  
  // Teaching Staff State
  const [teachingStaffMale, setTeachingStaffMale] = useState('')
  const [teachingStaffFemale, setTeachingStaffFemale] = useState('')
  const [teachingStaffTransgender, setTeachingStaffTransgender] = useState('')
  
  // Non-Teaching Staff State
  const [nonTeachingStaffMale, setNonTeachingStaffMale] = useState('')
  const [nonTeachingStaffFemale, setNonTeachingStaffFemale] = useState('')
  const [nonTeachingStaffTransgender, setNonTeachingStaffTransgender] = useState('')
  
  // Students State
  const [studentsMale, setStudentsMale] = useState('')
  const [studentsFemale, setStudentsFemale] = useState('')
  const [studentsTransgender, setStudentsTransgender] = useState('')
  
  // Statutory Committees State
  const [scStCommittee, setScStCommittee] = useState(false)
  const [minorityCell, setMinorityCell] = useState(false)
  const [grievanceRedressalCommittee, setGrievanceRedressalCommittee] = useState(false)
  const [internalComplaintsCommittee, setInternalComplaintsCommittee] = useState(false)
  const [obcCell, setObcCell] = useState(false)
  
  // Other Fields State
  const [rtiDeclaration, setRtiDeclaration] = useState('')
  const [rtiDeclarationUrl, setRtiDeclarationUrl] = useState('')
  const [academicMou, setAcademicMou] = useState('')
  const [academicMouDocument, setAcademicMouDocument] = useState<File | null>(null)
  const [academicMouDocumentUrl, setAcademicMouDocumentUrl] = useState<string>('')
  const [certificationDocument, setCertificationDocument] = useState<File | null>(null)
  const [certificationDocumentUrl, setCertificationDocumentUrl] = useState<string>('')

  // Load data from props when data changes
  useEffect(() => {
    // Get collegeId from localStorage
    const storedCollegeId = localStorage.getItem('collegeId');
    if (storedCollegeId) {
      setCollegeId(storedCollegeId);
    }

    // Load data from props if available
    if (data && data.answer) {
      const existingData = data.answer;
      console.log("Loading existing data from props:", existingData);
      
      // Populate teaching staff data
      setTeachingStaffMale(existingData.teachingStaff?.male || '');
      setTeachingStaffFemale(existingData.teachingStaff?.female || '');
      setTeachingStaffTransgender(existingData.teachingStaff?.transgender || '');
      
      // Populate non-teaching staff data
      setNonTeachingStaffMale(existingData.nonTeachingStaff?.male || '');
      setNonTeachingStaffFemale(existingData.nonTeachingStaff?.female || '');
      setNonTeachingStaffTransgender(existingData.nonTeachingStaff?.transgender || '');
      
      // Populate student data
      setStudentsMale(existingData.studentsOnRoll?.male || '');
      setStudentsFemale(existingData.studentsOnRoll?.female || '');
      setStudentsTransgender(existingData.studentsOnRoll?.transgender || '');
      
      // Populate statutory committees
      if (existingData.statutoryCommittees) {
        setScStCommittee(existingData.statutoryCommittees.scStCommittee || false);
        setMinorityCell(existingData.statutoryCommittees.minorityCell || false);
        setGrievanceRedressalCommittee(existingData.statutoryCommittees.grievanceRedressalCommittee || false);
        setInternalComplaintsCommittee(existingData.statutoryCommittees.internalComplaintsCommittee || false);
        setObcCell(existingData.statutoryCommittees.obcCell || false);
      }
      
      // Populate dates with proper parsing
      if (existingData.iqacEstablishmentDate) {
        setIqacDate(parseDate(existingData.iqacEstablishmentDate));
      }
      if (existingData.aisheUploadDate) {
        setAisheDate(parseDate(existingData.aisheUploadDate));
      }
      
      // Populate other fields
      setRtiDeclaration(existingData.rtiDeclaration || '');
      setRtiDeclarationUrl(existingData.rtiDeclarationUrl || '');
      setAcademicMou(existingData.academicMou || '');
      setAcademicMouDocumentUrl(existingData.academicMouDocumentUrl || '');
      setCertificationDocumentUrl(existingData.certificationDocumentUrl || '');
    }
  }, [data]); // Dependency on data prop

  // Validate file - Updated to 10MB
  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please select a PDF file only')
      setShowErrorModal(true)
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB')
      setShowErrorModal(true)
      return false
    }
    return true
  }

  // Handle file upload for Academic MoU
  const handleAcademicMouFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      // Check if collegeId is available
      if (!collegeId) {
        setErrorMessage('College ID not found. Please refresh the page and try again.')
        setShowErrorModal(true)
        return
      }

      setAcademicMouDocument(file)

      try {
        setIsUploading(true) // Start upload
        setUploadProgress(`Uploading Academic MoU document: ${file.name}...`)
        const url = await uploadFileToS3(file, collegeId, 'iiqa4')
        if (url) {
          setAcademicMouDocumentUrl(url)
          setUploadProgress(`Academic MoU document uploaded successfully!`)
          setTimeout(() => setUploadProgress(''), 3000)
        }
      } catch (error) {
        console.error('Academic MoU document upload error:', error);
        const errorMessage = error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`
        setErrorMessage(errorMessage)
        setShowErrorModal(true)
        setUploadProgress('')
      } finally {
        setIsUploading(false) // End upload
      }
    }
  }

  // Handle file upload for Certification Document
  const handleCertificationFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      // Check if collegeId is available
      if (!collegeId) {
        setErrorMessage('College ID not found. Please refresh the page and try again.')
        setShowErrorModal(true)
        return
      }

      setCertificationDocument(file)

      try {
        setIsUploading(true) // Start upload
        setUploadProgress(`Uploading certification document: ${file.name}...`)
        const url = await uploadFileToS3(file, collegeId, 'iiqa4')
        if (url) {
          setCertificationDocumentUrl(url)
          setUploadProgress(`Certification document uploaded successfully!`)
          setTimeout(() => setUploadProgress(''), 3000)
        }
      } catch (error) {
        console.error('Certification document upload error:', error);
        const errorMessage = error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`
        setErrorMessage(errorMessage)
        setShowErrorModal(true)
        setUploadProgress('')
      } finally {
        setIsUploading(false) // End upload
      }
    }
  }

  // Remove Academic MoU document
  const removeAcademicMouDocument = () => {
    setAcademicMouDocument(null)
    setAcademicMouDocumentUrl('')
  }

  // Remove Certification document
  const removeCertificationDocument = () => {
    setCertificationDocument(null)
    setCertificationDocumentUrl('')
  }

  // View file function
  const viewFile = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // File control component for consistent UI
// File control component for consistent UI with truncated file names
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

  // Date handlers
  const handleIqacDateChange = (selectedDate: Date | undefined) => {
    setIqacDate(selectedDate)
  }

  const handleAisheDateChange = (selectedDate: Date | undefined) => {
    setAisheDate(selectedDate)
  }

  // URL validation helper
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Prepare data for backend
  const prepareFormData = (): QualityInformationFormData => {
    return {
      teachingStaff: {
        male: teachingStaffMale,
        female: teachingStaffFemale,
        transgender: teachingStaffTransgender,
        total: calculateTotal(teachingStaffMale, teachingStaffFemale, teachingStaffTransgender)
      },
      nonTeachingStaff: {
        male: nonTeachingStaffMale,
        female: nonTeachingStaffFemale,
        transgender: nonTeachingStaffTransgender,
        total: calculateTotal(nonTeachingStaffMale, nonTeachingStaffFemale, nonTeachingStaffTransgender)
      },
      studentsOnRoll: {
        male: studentsMale,
        female: studentsFemale,
        transgender: studentsTransgender,
        total: calculateTotal(studentsMale, studentsFemale, studentsTransgender)
      },
      statutoryCommittees: {
        scStCommittee,
        minorityCell,
        grievanceRedressalCommittee,
        internalComplaintsCommittee,
        obcCell
      },
      iqacEstablishmentDate: dateToApiFormat(iqacDate),
      rtiDeclaration,
      rtiDeclarationUrl,
      academicMou,
      academicMouDocument: null,
      academicMouDocumentUrl: academicMouDocumentUrl || undefined,
      aisheUploadDate: dateToApiFormat(aisheDate),
      certificationDocument: null,
      certificationDocumentUrl: certificationDocumentUrl || undefined,
      id: "QIT4"
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      setUploadProgress('Submitting form data...')
      
      // Validate RTI URL if Yes is selected
      if (rtiDeclaration === 'Yes' && rtiDeclarationUrl && !isValidUrl(rtiDeclarationUrl)) {
        setErrorMessage('Please enter a valid URL for RTI declaration')
        setShowErrorModal(true)
        return
      }
      
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
          questionId: "iiqa4",
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
        setModalMessage('Quality information saved successfully!')
        setShowSuccessModal(true)
        if (onDataUpdate) {
  onDataUpdate();
}
      } else {
        setErrorMessage('Unexpected response from server')
        setShowErrorModal(true)
      }
      
    } catch (error: unknown) {
  console.error("❌ Error saving quality information:", error);

  let errorMessage = "An unknown error occurred";

  if (error && typeof error === "object") {
    const err = error as { code?: string; response?: unknown; message?: string };

    if (err.code === "ERR_NETWORK") {
      errorMessage =
        "Network error. Please check your internet connection and try again.";
    } else if (err.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please try again.";
    } else if (err.response && typeof err.response === "object") {
      const resp = err.response as { status?: number; statusText?: string };
      errorMessage = `Server error: ${resp.status ?? "Unknown"} ${
        resp.statusText ?? ""
      }`;
    } else if (err.message) {
      errorMessage = err.message;
    }
  }


  setErrorMessage(errorMessage);
  setShowErrorModal(true);
  setUploadProgress("");
}
finally {
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
          {/* {uploadProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">{uploadProgress}</p>
            </div>
          )} */}

          {/* Staff and Student Counts Section */}
          <div className="space-y-4" id="staff-student-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">Staff and Student Information</h3>
                <InfoTooltip content="Enter the total number of teaching staff, non-teaching staff, and students by gender. Numbers should be accurate and current." />
              </div>
            </div>
            
            {/* Teaching Staff Section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">Number of Teaching Staff by employment status (permanent / temporary) and by gender</h4>
                <InfoTooltip content="Include all teaching staff regardless of employment status (permanent/temporary/contractual). Count by gender categories." />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Male</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Female</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Transgender</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={teachingStaffMale}
                          onChange={(e) => setTeachingStaffMale(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={teachingStaffFemale}
                          onChange={(e) => setTeachingStaffFemale(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={teachingStaffTransgender}
                          onChange={(e) => setTeachingStaffTransgender(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50">
                        <div className="text-sm font-medium text-center">
                          {calculateTotal(teachingStaffMale, teachingStaffFemale, teachingStaffTransgender)}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Non-Teaching Staff Section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">Number of Non-Teaching Staff by employment status (permanent / temporary) and by gender</h4>
                <InfoTooltip content="Include all administrative, technical, and support staff. Count by gender categories including permanent and temporary staff." />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Male</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Female</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Transgender</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={nonTeachingStaffMale}
                          onChange={(e) => setNonTeachingStaffMale(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={nonTeachingStaffFemale}
                          onChange={(e) => setNonTeachingStaffFemale(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={nonTeachingStaffTransgender}
                          onChange={(e) => setNonTeachingStaffTransgender(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50">
                        <div className="text-sm font-medium text-center">
                          {calculateTotal(nonTeachingStaffMale, nonTeachingStaffFemale, nonTeachingStaffTransgender)}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Students on Roll Section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">Number of Students on roll by gender</h4>
                <InfoTooltip content="Total enrolled students currently on roll in the institution. Include all active students across all programs and levels." />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Male</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Female</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Transgender</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={studentsMale}
                          onChange={(e) => setStudentsMale(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={studentsFemale}
                          onChange={(e) => setStudentsFemale(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter number"
                          className="w-full text-sm"
                          value={studentsTransgender}
                          onChange={(e) => setStudentsTransgender(validateIntInput(e.target.value))}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50">
                        <div className="text-sm font-medium text-center">
                          {calculateTotal(studentsMale, studentsFemale, studentsTransgender)}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Statutory Committees Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800">Statutory Committees</h3>
              <InfoTooltip content="Select all statutory committees that are established and functional in your institution as per regulatory requirements." />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sc-st-committee"
                  checked={scStCommittee}
                  onCheckedChange={(checked) => setScStCommittee(checked as boolean)}
                />
                <Label htmlFor="sc-st-committee" className="text-sm flex items-center">
                  Committee for SC/ST
                  <InfoTooltip content="Committee established for Scheduled Castes and Scheduled Tribes welfare and grievances as per UGC guidelines." />
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="minority-cell"
                  checked={minorityCell}
                  onCheckedChange={(checked) => setMinorityCell(checked as boolean)}
                />
                <Label htmlFor="minority-cell" className="text-sm flex items-center">
                  Minority cell
                  <InfoTooltip content="Cell established for the welfare of minority community students and staff as per regulatory requirements." />
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="grievance-redressal-committee"
                  checked={grievanceRedressalCommittee}
                  onCheckedChange={(checked) => setGrievanceRedressalCommittee(checked as boolean)}
                />
                <Label htmlFor="grievance-redressal-committee" className="text-sm flex items-center">
                  Grievance Redressal Committee
                  <InfoTooltip content="Committee to address and resolve grievances of students, staff, and other stakeholders in a time-bound manner." />
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internal-complaints-committee"
                  checked={internalComplaintsCommittee}
                  onCheckedChange={(checked) => setInternalComplaintsCommittee(checked as boolean)}
                />
                <Label htmlFor="internal-complaints-committee" className="text-sm flex items-center">
                  Internal Complaints Committee
                  <InfoTooltip content="Committee established as per Sexual Harassment Act 2013 to address complaints of sexual harassment at workplace." />
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="obc-cell"
                  checked={obcCell}
                  onCheckedChange={(checked) => setObcCell(checked as boolean)}
                />
                <Label htmlFor="obc-cell" className="text-sm flex items-center">
                  OBC Cell
                  <InfoTooltip content="Cell established for Other Backward Classes welfare and to ensure their rights and benefits as per government guidelines." />
                </Label>
              </div>
            </div>
          </div>

          {/* Other Information Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800">Other Information</h3>
              <InfoTooltip content="Additional institutional information including IQAC details, RTI compliance, MoUs, and certifications." />
            </div>
            
            {/* IQAC Establishment Date */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-full sm:w-40">
                  IQAC Establishment Date
                </Label>
                <InfoTooltip content="Date when Internal Quality Assurance Cell (IQAC) was established in the institution. Format: DD-MM-YYYY" />
              </div>
              <Popover open={iqacDateOpen} onOpenChange={setIqacDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-80 justify-between font-normal text-sm"
                  >
                    {iqacDate ? formatDate(iqacDate) : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={iqacDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      handleIqacDateChange(date)
                      setIqacDateOpen(false)
                    }}
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* RTI Declaration */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center">
                  <Label className="text-sm font-medium w-full sm:w-40">
                    RTI Declaration
                  </Label>
                  <InfoTooltip content="Whether the institution has published RTI (Right to Information) declaration on its website as per RTI Act 2005." />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="rti-yes"
                      name="rti-declaration"
                      value="Yes"
                      checked={rtiDeclaration === 'Yes'}
                      onChange={(e) => setRtiDeclaration(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="rti-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="rti-no"
                      name="rti-declaration"
                      value="No"
                      checked={rtiDeclaration === 'No'}
                      onChange={(e) => setRtiDeclaration(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="rti-no" className="text-sm">No</Label>
                  </div>
                </div>
              </div>
              
              {rtiDeclaration === 'Yes' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium w-full sm:w-40">
                      RTI Declaration URL
                    </Label>
                    <InfoTooltip content="Provide the web URL where RTI declaration is published on your institution's website." />
                  </div>
                  <Input 
                    type="url"
                    placeholder="Enter URL (e.g., https://example.com)"
                    className="w-full sm:w-80 text-sm"
                    value={rtiDeclarationUrl}
                    onChange={(e) => setRtiDeclarationUrl(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Academic MoU */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center">
                  <Label className="text-sm font-medium w-full sm:w-40">
                    Academic MoU
                  </Label>
                  <InfoTooltip content="Whether the institution has signed academic Memorandum of Understanding (MoU) with other institutions for academic collaboration." />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mou-yes"
                      name="academic-mou"
                      value="Yes"
                      checked={academicMou === 'Yes'}
                      onChange={(e) => setAcademicMou(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="mou-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mou-no"
                      name="academic-mou"
                      value="No"
                      checked={academicMou === 'No'}
                      onChange={(e) => setAcademicMou(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="mou-no" className="text-sm">No</Label>
                  </div>
                </div>
              </div>
              
              {academicMou === 'Yes' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium w-full sm:w-40">
                      Academic MoU Document
                    </Label>
                    <InfoTooltip content="Upload signed academic MoU document(s). PDF format only, maximum 10MB." />
                  </div>
                  <div className="space-y-1 w-full sm:w-80">
                    <Input 
                      type="file"
                      accept=".pdf"
                      onChange={handleAcademicMouFileChange}
                      className="w-full text-sm truncate"
                    />
                    <p className="text-xs text-gray-500">
                      PDF only (10MB Max.)
                    </p>
                    <FileControl
                      documentUrl={academicMouDocumentUrl}
                      document={academicMouDocument}
                      onRemove={removeAcademicMouDocument}
                      documentName="Academic MoU Document"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* AISHE Upload Date */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-full sm:w-40">
                  AISHE Upload Date
                </Label>
                <InfoTooltip content="Date when institution data was last uploaded to AISHE (All India Survey on Higher Education) portal. Format: DD-MM-YYYY" />
              </div>
              <Popover open={aisheDateOpen} onOpenChange={setAisheDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-80 justify-between font-normal text-sm"
                  >
                    {aisheDate ? formatDate(aisheDate) : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={aisheDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      handleAisheDateChange(date)
                      setAisheDateOpen(false)
                    }}
                    fromYear={2010}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Certification Document */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium w-full sm:w-40">
                  Certification Document
                </Label>
                <InfoTooltip content="Upload any relevant institutional certification documents such as accreditation certificates, recognition letters, etc. PDF format only, maximum 10MB." />
              </div>
              <div className="space-y-1 w-full sm:w-80">
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleCertificationFileChange}
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500">
                  PDF only (10MB Max.)
                </p>
                <FileControl
                  documentUrl={certificationDocumentUrl}
                  document={certificationDocument}
                  onRemove={removeCertificationDocument}
                  documentName="Certification Document"
                />
              </div>
            </div>
          </div>
        </form>
        
        {/* Mobile Save Button */}
  <div className="lg:hidden fixed bottom-6 right-6 z-40">
    <Button 
        onClick={handleSubmit}
        disabled={isSubmitting || isUploading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Save className="h-5 w-5" />
        <span className="hidden sm:inline">
            {isUploading ? 'Uploading file...' : isSubmitting ? 'Saving...' : 'Save'}
        </span>
    </Button>
</div>


<div className="hidden lg:block">
    <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting || isUploading}
        className="fixed bottom-7 right-15 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Save className="h-5 w-5" />
        <span>
            {isUploading ? 'Uploading file...' : isSubmitting ? 'Saving...' : 'Save'}
        </span>
    </Button>
</div></div>
    </TooltipProvider>
  )
}
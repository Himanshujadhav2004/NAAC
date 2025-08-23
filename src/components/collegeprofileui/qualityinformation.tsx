import React, { useState, useEffect } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Calendar } from "@/components/ui/calendar"
import { ChevronDownIcon } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import axios from 'axios'

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

// S3 Upload utility function
const uploadFileToS3 = async (file: File): Promise<string | null> => {
  try {
    console.log('Starting file upload for:', file.name);
    
    const response = await axios.get(
      "https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/upload-url",
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
  } catch (error) {
    console.error("S3 upload failed:", error);
    
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
const fetchExistingData = async (questionId: string): Promise<QualityInformationFormData | null> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, starting with empty form');
      return null;
    }

    const response = await axios.get(
      'https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/answers?questionId=iiqa4',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log("GET response:", response.data);
    const allAnswers = response.data;

    const iiqa4Data = allAnswers.find((item: { questionId: string }) => item.questionId === "iiqa4");

    if (iiqa4Data && iiqa4Data.answer) {
      console.log("iiqa4 answer:", iiqa4Data.answer);
      return iiqa4Data.answer;
    } else {
      console.log("No data found for iiqa4");
      return null;
    }
  } catch (error) {
    console.error('Error fetching existing data:', error);
    return null;
  }
};

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

export const Qualityinformation = () => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  
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

  // Load existing data on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        const existingData = await fetchExistingData("iiqa4");
        
        if (existingData) {
          console.log("Loading existing data:", existingData);
          
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
          
          // Populate dates
          if (existingData.iqacEstablishmentDate) {
            setIqacDate(new Date(existingData.iqacEstablishmentDate));
          }
          if (existingData.aisheUploadDate) {
            setAisheDate(new Date(existingData.aisheUploadDate));
          }
          
          // Populate other fields
          setRtiDeclaration(existingData.rtiDeclaration || '');
          setRtiDeclarationUrl(existingData.rtiDeclarationUrl || '');
          setAcademicMou(existingData.academicMou || '');
          setAcademicMouDocumentUrl(existingData.academicMouDocumentUrl || '');
          setCertificationDocumentUrl(existingData.certificationDocumentUrl || '');
        }
      } catch (error) {
        console.error('Error loading existing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, []);

  // Validate file
  const validateFile = (file: File, maxSize: number): boolean => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file only')
      return false
    }
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return false
    }
    return true
  }

  // Handle file upload for Academic MoU
  const handleAcademicMouFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file, 10)) {
      // Update the document first
      setAcademicMouDocument(file)

      // Upload the file
      try {
        setUploadProgress(`Uploading Academic MoU document: ${file.name}...`)
        const url = await uploadFileToS3(file)
        if (url) {
          setAcademicMouDocumentUrl(url)
          setUploadProgress(`Academic MoU document uploaded successfully!`)
          setTimeout(() => setUploadProgress(''), 3000)
        }
      } catch (error) {
        console.error('Academic MoU document upload error:', error);
        alert((error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`))
        setUploadProgress('')
      }
    }
  }

  // Handle file upload for Certification Document
  const handleCertificationFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file, 5)) {
      // Update the document first
      setCertificationDocument(file)

      // Upload the file
      try {
        setUploadProgress(`Uploading certification document: ${file.name}...`)
        const url = await uploadFileToS3(file)
        if (url) {
          setCertificationDocumentUrl(url)
          setUploadProgress(`Certification document uploaded successfully!`)
          setTimeout(() => setUploadProgress(''), 3000)
        }
      } catch (error) {
        console.error('Certification document upload error:', error);
        alert((error instanceof Error ? error.message : `Failed to upload ${file.name}. Please try again.`))
        setUploadProgress('')
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
      iqacEstablishmentDate: iqacDate ? iqacDate.toISOString().split('T')[0] : '',
      rtiDeclaration,
      rtiDeclarationUrl,
      academicMou,
      academicMouDocument: null, // Don't include File objects in API call
      academicMouDocumentUrl: academicMouDocumentUrl || undefined,
      aisheUploadDate: aisheDate ? aisheDate.toISOString().split('T')[0] : '',
      certificationDocument: null, // Don't include File objects in API call
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
        alert('Please enter a valid URL for RTI declaration')
        return
      }
      
      const formData = prepareFormData()
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      // Submit to your API
      const response = await axios.post(
        'https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/answers',
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
        alert('Quality information saved successfully!')
      } else {
        throw new Error('Unexpected response from server')
      }
      
    } catch (error) {
      console.error('Error saving quality information:', error)
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



  return (
    <div className="w-full max-w-6xl mx-auto max-h-[80vh] flex flex-col">
      <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Upload Progress Indicator */}
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">{uploadProgress}</p>
          </div>
        )}

        {/* Staff and Student Counts Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Staff and Student Information</h3>
          
          {/* Teaching Staff Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-3">Number of Teaching Staff by employment status (permanent / temporary) and by gender</h4>
            
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
            <h4 className="text-sm font-medium mb-3">Number of Non-Teaching Staff by employment status (permanent / temporary) and by gender</h4>
            
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
            <h4 className="text-sm font-medium mb-3">Number of Students on roll by gender</h4>
            
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statutory Committees</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sc-st-committee"
                checked={scStCommittee}
                onCheckedChange={(checked) => setScStCommittee(checked as boolean)}
              />
              <Label htmlFor="sc-st-committee" className="text-sm">Committee for SC/ST</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="minority-cell"
                checked={minorityCell}
                onCheckedChange={(checked) => setMinorityCell(checked as boolean)}
              />
              <Label htmlFor="minority-cell" className="text-sm">Minority cell</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="grievance-redressal-committee"
                checked={grievanceRedressalCommittee}
                onCheckedChange={(checked) => setGrievanceRedressalCommittee(checked as boolean)}
              />
              <Label htmlFor="grievance-redressal-committee" className="text-sm">Grievance Redressal Committee</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="internal-complaints-committee"
                checked={internalComplaintsCommittee}
                onCheckedChange={(checked) => setInternalComplaintsCommittee(checked as boolean)}
              />
              <Label htmlFor="internal-complaints-committee" className="text-sm">Internal Complaints Committee</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="obc-cell"
                checked={obcCell}
                onCheckedChange={(checked) => setObcCell(checked as boolean)}
              />
              <Label htmlFor="obc-cell" className="text-sm">OBC Cell</Label>
            </div>
          </div>
        </div>

        {/* Other Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Information</h3>
          
          {/* IQAC Establishment Date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Label className="text-sm font-medium w-40">
              IQAC Establishment Date
            </Label>
            <Popover open={iqacDateOpen} onOpenChange={setIqacDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-80 justify-between font-normal text-sm"
                >
                  {iqacDate ? iqacDate.toLocaleDateString() : "Select date"}
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* RTI Declaration */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-sm font-medium w-40">
                RTI Declaration
              </Label>
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
                <Label className="text-sm font-medium w-40">
                  RTI Declaration URL
                </Label>
                <Input 
                  type="url"
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="w-80 text-sm"
                  value={rtiDeclarationUrl}
                  onChange={(e) => setRtiDeclarationUrl(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Academic MoU */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Label className="text-sm font-medium w-40">
                Academic MoU
              </Label>
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
                <Label className="text-sm font-medium w-40">
                  Academic MoU Document
                </Label>
                <div className="space-y-1">
                  <Input 
                    type="file"
                    accept=".pdf"
                    onChange={handleAcademicMouFileChange}
                    className="w-80 text-sm"
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
            <Label className="text-sm font-medium w-40">
              AISHE Upload Date
            </Label>
            <Popover open={aisheDateOpen} onOpenChange={setAisheDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-80 justify-between font-normal text-sm"
                >
                  {aisheDate ? aisheDate.toLocaleDateString() : "Select date"}
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Certification Document */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Label className="text-sm font-medium w-40">
              Certification Document
            </Label>
            <div className="space-y-1">
              <Input 
                type="file"
                accept=".pdf"
                onChange={handleCertificationFileChange}
                className="w-80 text-sm"
              />
              <p className="text-xs text-gray-500">
                PDF only (5MB Max.)
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
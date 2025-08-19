import React, { useState } from 'react'
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
  aisheUploadDate: string
  certificationDocument: File | null
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

export const Qualityinformation = () => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
  const [certificationDocument, setCertificationDocument] = useState<File | null>(null)

  // Handle file upload for Academic MoU
  const handleAcademicMouFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only')
        return
      }
      // Validate file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setAcademicMouDocument(file)
    }
  }

  // Handle file upload for Certification Document
  const handleCertificationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only')
        return
      }
      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setCertificationDocument(file)
    }
  }

  // Date handlers
  const handleIqacDateChange = (selectedDate: Date | undefined) => {
    setIqacDate(selectedDate)
    const dateString = selectedDate ? selectedDate.toISOString().split('T')[0] : ''
    // Update form data with date string
  }

  const handleAisheDateChange = (selectedDate: Date | undefined) => {
    setAisheDate(selectedDate)
    const dateString = selectedDate ? selectedDate.toISOString().split('T')[0] : ''
    // Update form data with date string
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
      academicMouDocument,
      aisheUploadDate: aisheDate ? aisheDate.toISOString().split('T')[0] : '',
      certificationDocument
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Validate RTI URL if Yes is selected
      if (rtiDeclaration === 'Yes' && rtiDeclarationUrl && !isValidUrl(rtiDeclarationUrl)) {
        alert('Please enter a valid URL for RTI declaration')
        return
      }
      
      const formData = prepareFormData()
      
      // Prepare complete data object
      const completeData = {
        qualityInformation: formData,
    
      }
      
      // Log all data to console

      console.log('Complete Form Data:', completeData)
   
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/quality-information', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(completeData)
      // })
      
      // if (!response.ok) {
      //   throw new Error('Failed to save quality information')
      // }
      
      // const result = await response.json()
      // console.log('Success:', result)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ Quality information saved successfully!')
      
    } catch (error) {
      console.error('❌ Error saving quality information:', error)
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto max-h-[80vh] flex flex-col">
      <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
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
                                         <td className="border border-gray-300 px-3 py-2 bg-white">
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
                                         <td className="border border-gray-300 px-3 py-2 bg-white">
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
                                         <td className="border border-gray-300 px-3 py-2 bg-white">
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
                  {academicMouDocument && (
                    <p className="text-xs text-green-600">
                      Selected: {academicMouDocument.name}
                    </p>
                  )}
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
              {certificationDocument && (
                <p className="text-xs text-green-600">
                  Selected: {certificationDocument.name}
                </p>
              )}
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

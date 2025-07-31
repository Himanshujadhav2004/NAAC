import React, { useState } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

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
}

interface ProgrammeDetail {
  id: string
  program: string
  department: string
  universityAffiliation: string
  sraRecognition: string
  affiliationStatus: string
  document: File | null
}

// Helper to validate integer input between 0 and 100
const validateIntInput = (value: string) => {
  if (value === '') return ''
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) return '0'
  if (num > 100) return '100'
  return String(num)
}

export const Academicprograms = () => {
  // State management for integer inputs
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Sample universities for dropdown
  const universities = [
    "Delhi University", "Mumbai University", "Kolkata University", "Chennai University",
    "Bangalore University", "Pune University", "Hyderabad University", "Ahmedabad University",
    "Jaipur University", "Lucknow University", "Patna University", "Bhopal University"
  ]

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
    setProgrammeDetails(prev => prev.filter(item => item.id !== id))
  }

  // Update programme detail field
  const updateProgrammeDetail = (id: string, field: keyof ProgrammeDetail, value: string | File | null) => {
    setProgrammeDetails(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // Handle file upload for programme details
  const handleProgrammeFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
      updateProgrammeDetail(id, 'document', file)
    }
  }

  // Prepare data for backend
  const prepareFormData = (): AcademicProgramsFormData => {
    return {
      ugPrograms: ugPrograms,
      pgPrograms: pgPrograms,
      postMastersPrograms: postMastersPrograms,
      preDoctoralPrograms: preDoctoralPrograms,
      doctoralPrograms: doctoralPrograms,
      postDoctoralPrograms: postDoctoralPrograms,
      pgDiplomaPrograms: pgDiplomaPrograms,
      diplomaPrograms: diplomaPrograms,
      certificatePrograms: certificatePrograms
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      const formData = prepareFormData()
      
      // Prepare complete data object
      const completeData = {
        programCounts: formData,
        programmeDetails: programmeDetails,
        timestamp: new Date().toISOString(),
        totalProgrammeEntries: programmeDetails.length
      }
      
      // Log all data to console
      console.log('=== ACADEMIC PROGRAMS FORM DATA ===')
      console.log('Complete Form Data:', completeData)
      console.log('---')
      console.log('Program Counts:', formData)
      console.log('---')
      console.log('Programme Details:', programmeDetails)
      console.log('---')
      console.log('Summary:')
      console.log(`- Total Programme Entries: ${programmeDetails.length}`)
      console.log(`- UG Programs: ${formData.ugPrograms || 0}`)
      console.log(`- PG Programs: ${formData.pgPrograms || 0}`)
      console.log(`- Post Master's Programs: ${formData.postMastersPrograms || 0}`)
      console.log(`- Pre Doctoral Programs: ${formData.preDoctoralPrograms || 0}`)
      console.log(`- Doctoral Programs: ${formData.doctoralPrograms || 0}`)
      console.log(`- Post Doctoral Programs: ${formData.postDoctoralPrograms || 0}`)
      console.log(`- PG Diploma Programs: ${formData.pgDiplomaPrograms || 0}`)
      console.log(`- Diploma Programs: ${formData.diplomaPrograms || 0}`)
      console.log(`- Certificate Programs: ${formData.certificatePrograms || 0}`)
      console.log('=== END OF DATA ===')
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/academic-programs', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(completeData)
      // })
      
      // if (!response.ok) {
      //   throw new Error('Failed to save academic programs')
      // }
      
      // const result = await response.json()
      // console.log('Success:', result)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ Academic programs saved successfully!')
      
    } catch (error) {
      console.error('❌ Error saving academic programs:', error)
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto max-h-[80vh] flex flex-col">
      <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Integer Input Fields Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Program Counts</h3>
          
          {/* UG Programs Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Label className="text-sm font-medium w-40">
              UG Programs
            </Label>
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
            <Label className="text-sm font-medium w-40">
              PG Programs
            </Label>
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
            <Label className="text-sm font-medium w-40">
              Post Master's (DM, Ayurveda Vachaspathi, M.Ch)
            </Label>
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
            <Label className="text-sm font-medium w-40">
              Pre Doctoral (M.Phil)
            </Label>
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
            <Label className="text-sm font-medium w-40">
              Doctoral (Ph.D)
            </Label>
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
            <Label className="text-sm font-medium w-40">
              Post Doctoral (D.Sc, D.Litt, LED)
            </Label>
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
            <Label className="text-sm font-medium w-40">
              PG Diploma recognised by statutory authority including university
            </Label>
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
            <Label className="text-sm font-medium w-40">
              Diploma
            </Label>
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
            <Label className="text-sm font-medium w-40">
              Certificate / Awareness
            </Label>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Programme Details (Table as below)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">Program</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">Department</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">University Affiliation</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">SRA Recognition</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">Affiliation Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">Upload</th>
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
                        {programme.document && (
                          <p className="text-xs text-green-600">
                            Selected: {programme.document.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProgrammeDetail(programme.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
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

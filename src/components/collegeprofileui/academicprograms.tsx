import React, { useState } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

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

// Helper to validate integer input between 0 and 100
const validateIntInput = (value: string) => {
  if (value === '') return ''
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) return '0'
  if (num > 100) return '100'
  return String(num)
}

export const Academicprograms = () => {
  // State management
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
      
      // Log for development
      console.log('Academic Programs Form Data for Backend:', formData)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/academic-programs', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData)
      // })
      
      // if (!response.ok) {
      //   throw new Error('Failed to save academic programs')
      // }
      
      // const result = await response.json()
      // console.log('Success:', result)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Academic programs saved successfully!')
      
    } catch (error) {
      console.error('Error saving academic programs:', error)
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto max-h-[80vh] flex flex-col">
      <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-4">
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

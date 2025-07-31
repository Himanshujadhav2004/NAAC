import React, { useState } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'

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
}

interface AffiliationFormData {
  natureOfCollege: string[]
  collegeAffiliation: string
  universityName: string
  universityState: string
  affiliationDocument: File | null
  ugcRecognition: string
  ugcDocument: File | null
  ugc12BRecognition: string
  ugc12BDocument: File | null
  autonomousCollege: string
  autonomousCollegeDocument: File | null
  cpeRecognition: string
  cpeDocument: File | null
  collegeOfExcellence: string
  collegeOfExcellenceDocument: File | null
  sraPrograms: string
  sraProgramList: SRAProgram[]
  aiuRecognition: string
  aiuDocument: File | null
}

export const Affiliationdetials = () => {
  // State management
  const [natureSelections, setNatureSelections] = useState<NatureSelections>({
    private: false,
    government: false,
    selfFinancing: false,
    grantInAid: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [collegeAffiliation, setCollegeAffiliation] = useState('')
  const [universityName, setUniversityName] = useState('')
  const [universityState, setUniversityState] = useState('')
  const [affiliationDocument, setAffiliationDocument] = useState<File | null>(null)
  const [ugcRecognition, setUgcRecognition] = useState('')
  const [ugcDocument, setUgcDocument] = useState<File | null>(null)
  const [ugc12BRecognition, setUgc12BRecognition] = useState('')
  const [ugc12BDocument, setUgc12BDocument] = useState<File | null>(null)
  const [autonomousCollege, setAutonomousCollege] = useState('')
  const [autonomousCollegeDocument, setAutonomousCollegeDocument] = useState<File | null>(null)
  const [cpeRecognition, setCpeRecognition] = useState('')
  const [cpeDocument, setCpeDocument] = useState<File | null>(null)
  const [collegeOfExcellence, setCollegeOfExcellence] = useState('')
  const [collegeOfExcellenceDocument, setCollegeOfExcellenceDocument] = useState<File | null>(null)
  const [sraPrograms, setSraPrograms] = useState('')
  const [sraProgramList, setSraProgramList] = useState<SRAProgram[]>([])
  const [aiuRecognition, setAiuRecognition] = useState('')
  const [aiuDocument, setAiuDocument] = useState<File | null>(null)

  // India states data
  const indiaStates = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Delhi", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ]

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

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAffiliationDocument(file)
    }
  }

  // Handle UGC document upload
  const handleUgcFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUgcDocument(file)
    }
  }

  // Handle UGC 12B document upload
  const handleUgc12BFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUgc12BDocument(file)
    }
  }

  // Handle Autonomous College document upload
  const handleAutonomousCollegeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAutonomousCollegeDocument(file)
    }
  }

  // Handle CPE document upload
  const handleCpeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCpeDocument(file)
    }
  }

  // Handle College of Excellence document upload
  const handleCollegeOfExcellenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCollegeOfExcellenceDocument(file)
    }
  }

  // Handle SRA program document upload
  const handleSRAFileChange = (programId: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setSraProgramList(prev => prev.map(program => 
        program.id === programId 
          ? { ...program, document: file }
          : program
      ))
    }
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

  // Handle AIU document upload
  const handleAiuFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAiuDocument(file)
    }
  }

  // Prepare data for backend
  const prepareFormData = (): AffiliationFormData => {
    const selectedNatures = Object.entries(natureSelections)
      .filter(([_, isSelected]) => isSelected)
      .map(([key, _]) => key)

    return {
      natureOfCollege: selectedNatures,
      collegeAffiliation: collegeAffiliation,
      universityName: universityName,
      universityState: universityState,
      affiliationDocument: affiliationDocument,
      ugcRecognition: ugcRecognition,
      ugcDocument: ugcDocument,
      ugc12BRecognition: ugc12BRecognition,
      ugc12BDocument: ugc12BDocument,
      autonomousCollege: autonomousCollege,
      autonomousCollegeDocument: autonomousCollegeDocument,
      cpeRecognition: cpeRecognition,
      cpeDocument: cpeDocument,
      collegeOfExcellence: collegeOfExcellence,
      collegeOfExcellenceDocument: collegeOfExcellenceDocument,
      sraPrograms: sraPrograms,
      sraProgramList: sraProgramList,
      aiuRecognition: aiuRecognition,
      aiuDocument: aiuDocument
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      const formData = prepareFormData()
      
      // Log for development
      console.log('Form Data for Backend:', formData)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/affiliation-details', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData)
      // })
      
      // if (!response.ok) {
      //   throw new Error('Failed to save affiliation details')
      // }
      
      // const result = await response.json()
      // console.log('Success:', result)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Affiliation details saved successfully!')
      
    } catch (error) {
      console.error('Error saving affiliation details:', error)
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto max-h-[80vh] flex flex-col">
      <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
               {affiliationDocument && (
                 <p className="text-xs text-green-600 mt-1">
                   Selected: {affiliationDocument.name}
                 </p>
               )}
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
                    {ugcDocument && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected: {ugcDocument.name}
                      </p>
                    )}
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
                     {ugc12BDocument && (
                       <p className="text-xs text-green-600 mt-1">
                         Selected: {ugc12BDocument.name}
                       </p>
                     )}
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
                     {autonomousCollegeDocument && (
                       <p className="text-xs text-green-600 mt-1">
                         Selected: {autonomousCollegeDocument.name}
                       </p>
                     )}
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
                     {cpeDocument && (
                       <p className="text-xs text-green-600 mt-1">
                         Selected: {cpeDocument.name}
                       </p>
                     )}
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
                     {collegeOfExcellenceDocument && (
                       <p className="text-xs text-green-600 mt-1">
                         Selected: {collegeOfExcellenceDocument.name}
                       </p>
                     )}
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
                               {program.document && (
                                 <p className="text-xs text-green-600 mt-1">
                                   Selected: {program.document.name}
                                 </p>
                               )}
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
                      {aiuDocument && (
                        <p className="text-xs text-green-600 mt-1">
                          Selected: {aiuDocument.name}
                        </p>
                      )}
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

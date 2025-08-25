import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ChevronDownIcon, Info, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import axios from 'axios'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { locationData } from '@/app/data/data'

interface CollegeFormData {
  collegeAISHEID: string;
  cycleOfAccreditation: string;
  collegeName: string;
  establishmentDate: string;
  headOfInstitution: string;
  designation: string;
  ownCampus: string;
  address: string;
  state: string;
  district: string;
  city: string;
  pin: string;
  phoneNo: string;
  faxNo: string;
  mobileNo: string;
  email: string;
  alternateEmail: string;
  website: string;

  // Alternate Faculty Contact
  alternateFacultyName: string;
  alternateAddress: string;
  alternateState: string;
  alternateDistrict: string;
  alternateCity: string;
  alternatePin: string;
  alternatePhoneNo: string;
  alternateFaxNo: string;
  alternateMobileNo: string;
  alternateFacultyEmail: string;
  alternateFacultyAlternateEmail: string;
}

// Info Tooltip Component
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

export const Basiceligibilty = () => {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [selectedState, setSelectedState] = useState('')
    const [selectedDistrict, setSelectedDistrict] = useState('')
    const [districts, setDistricts] = useState<string[]>([])
    
    // Alternate Faculty Contact States
    const [selectedAlternateState, setSelectedAlternateState] = useState('')
    const [selectedAlternateDistrict, setSelectedAlternateDistrict] = useState('')
    const [alternateDistricts, setAlternateDistricts] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fetchedData, setFetchedData] = useState<any>(null);
    
    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    
    // Form state
    const [formData, setFormData] = useState<CollegeFormData>({
        collegeAISHEID: '',
        cycleOfAccreditation: '',
        collegeName: '',
        establishmentDate: '',
        headOfInstitution: '',
        designation: '',
        ownCampus: '',
        address: '',
        state: '',
        district: '',
        city: '',
        pin: '',
        phoneNo: '',
        faxNo: '',
        mobileNo: '',
        email: '',
        alternateEmail: '',
        website: '',
        alternateFacultyName: '',
        alternateAddress: '',
        alternateState: '',
        alternateDistrict: '',
        alternateCity: '',
        alternatePin: '',
        alternatePhoneNo: '',
        alternateFaxNo: '',
        alternateMobileNo: '',
        alternateFacultyEmail: '',
        alternateFacultyAlternateEmail: ''
    });

    const indiaData = locationData;
    
    const handleStateChange = (value: string) => {
        setSelectedState(value)
        setSelectedDistrict('') // Reset district when state changes
        setDistricts(indiaData[value as keyof typeof indiaData] || [])
        setFormData(prev => ({ ...prev, state: value || '', district: '' }))
    }

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value)
        setFormData(prev => ({ ...prev, district: value || '' }))
    }

    // Alternate Faculty Contact Handlers
    const handleAlternateStateChange = (value: string) => {
        setSelectedAlternateState(value)
        setSelectedAlternateDistrict('') // Reset district when state changes
        setAlternateDistricts(indiaData[value as keyof typeof indiaData] || [])
        setFormData(prev => ({ ...prev, alternateState: value || '', alternateDistrict: '' }))
    }

    const handleAlternateDistrictChange = (value: string) => {
        setSelectedAlternateDistrict(value)
        setFormData(prev => ({ ...prev, alternateDistrict: value || '' }))
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value || '' }))
    }

    const handleNumberInputChange = (field: string, value: string, maxLength: number) => {
        // Only allow digits and limit length
        const numericValue = value.replace(/[^0-9]/g, '')
        if (numericValue.length <= maxLength) {
            setFormData(prev => ({ ...prev, [field]: numericValue || '' }))
        }
    }

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate)

        let dateString = ''
        if (selectedDate) {
            const day = String(selectedDate.getDate()).padStart(2, '0')
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
            const year = selectedDate.getFullYear()
            // choose format depending on backend needs
            dateString = `${year}-${month}-${day}`   // yyyy-mm-dd  ✅ safe for DB
            // OR dateString = `${day}-${month}-${year}` // dd-mm-yyyy (if you prefer UI format)
        }

        setFormData(prev => ({
            ...prev,
            establishmentDate: dateString
        }))
    }

    const getAgeInYearsAndMonths = (selectedDate?: Date) => {
        if (!selectedDate) return "";

        const today = new Date();
        let years = today.getFullYear() - selectedDate.getFullYear();
        let months = today.getMonth() - selectedDate.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            setIsSubmitting(true)
            
            // Update form data with current state values
            const completeData = {
                ...formData,
                id:"CPT1",
                state: selectedState,
                district: selectedDistrict,
                alternateState: selectedAlternateState,
                alternateDistrict: selectedAlternateDistrict,
                ageOfInstitution: getAgeInYearsAndMonths(date)
            }
            
            // Log all data to console
            console.log('=== BASIC ELIGIBILITY FORM DATA ===')
            console.log('Complete Form Data:', completeData)
       
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/answers",
                {
                    questionId: "iiqa1",
                    answer: {
                        collegeAISHEID: completeData.collegeAISHEID,
                        cycleOfAccreditation: completeData.cycleOfAccreditation,
                        collegeName: completeData.collegeName,
                        establishmentDate: completeData.establishmentDate,
                        ageOfInstitution: getAgeInYearsAndMonths(date),
                        headOfInstitution: completeData.headOfInstitution,
                        designation: completeData.designation,
                        ownCampus: completeData.ownCampus,
                        address: completeData.address,
                        state: completeData.state,
                        district: completeData.district,
                        city: completeData.city,
                        pin: completeData.pin,
                        phoneNo: completeData.phoneNo,
                        faxNo: completeData.faxNo,
                        mobileNo: completeData.mobileNo,
                        email: completeData.email,
                        alternateEmail: completeData.alternateEmail,
                        website: completeData.website,
                        alternateFacultyName: completeData.alternateFacultyName,
                        alternateAddress: completeData.alternateAddress,
                        alternateState: completeData.alternateState,
                        alternateDistrict: completeData.alternateDistrict,
                        alternateCity: completeData.alternateCity,
                        alternatePin: completeData.alternatePin,
                        alternatePhoneNo: completeData.alternatePhoneNo,
                        alternateFaxNo: completeData.alternateFaxNo,
                        alternateMobileNo: completeData.alternateMobileNo,
                        alternateFacultyEmail: completeData.alternateFacultyEmail,
                        alternateFacultyAlternateEmail: completeData.alternateFacultyAlternateEmail,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log(response.data.message || "User data has been saved successfully!");
            
            // Show success modal
            setModalMessage('Basic eligibility information saved successfully!')
            setShowSuccessModal(true)
            
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('✅ Basic eligibility saved successfully!')
            
        } catch (error) {
            console.error('❌ Error saving basic eligibility:', error)
            
            let errorMessage = 'An error occurred while saving the form';
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as any;
                errorMessage = `Server error: ${err.response?.status || 'Unknown'} ${err.response?.statusText || ''}`;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            setModalMessage(errorMessage)
            setShowSuccessModal(true)
        } finally {
            setIsSubmitting(false)
        }
    }
    
    function formatDate(date: Date | undefined) {
        if (!date) return ""
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    }

    // convert "dd-mm-yyyy" string back to Date for Calendar
    function parseDate(dateString: string): Date | undefined {
        if (!dateString) return undefined
        const [day, month, year] = dateString.split("-").map(Number)
        return new Date(year, month - 1, day)
    }

    useEffect(() => {
        const fetchAnswers = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/answers`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = response.data[0];
                setFetchedData(data);

                if (data && data.answer) {
                    // Ensure all fields have defined values to prevent controlled/uncontrolled input errors
                    const sanitizedAnswer = Object.keys(formData).reduce((acc, key) => {
                        acc[key] = data.answer[key] || '';
                        return acc;
                    }, {} as any);
                    setFormData(sanitizedAnswer);

                    if (data.answer.establishmentDate) {
                        setDate(new Date(data.answer.establishmentDate));
                    }

                    if (data.answer.state) {
                        setSelectedState(data.answer.state);
                        setDistricts(indiaData[data.answer.state as keyof typeof indiaData] || []);
                    }

                    if (data.answer.alternateState) {
                        setSelectedAlternateState(data.answer.alternateState);
                        setAlternateDistricts(indiaData[data.answer.alternateState as keyof typeof indiaData] || []);
                    }
                }

                console.log("📥 Retrieved data:", data);
            } catch (error) {
                console.error("❌ Error fetching answers:", error);
            }
        };

        fetchAnswers();
    }, []);

    // ✅ Auto select district when districts are populated
    useEffect(() => {
        if (districts.length > 0 && fetchedData?.answer?.district) {
            setSelectedDistrict(fetchedData.answer.district);
        }
    }, [districts, fetchedData]);

    // ✅ Auto select alternate district
    useEffect(() => {
        if (alternateDistricts.length > 0 && fetchedData?.answer?.alternateDistrict) {
            setSelectedAlternateDistrict(fetchedData.answer.alternateDistrict);
        }
    }, [alternateDistricts, fetchedData]);

    return (
        <TooltipProvider>
            <div className="w-full max-w-6xl mx-auto h-full flex flex-col relative">
                
                {/* Success Modal */}
                <SuccessModal 
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    message={modalMessage}
                />

                <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
                
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="College_AISHE_ID" className="text-sm font-medium w-40">
                                College AISHE ID
                            </label>
                            <InfoTooltip content="Enter the unique AISHE (All India Survey on Higher Education) ID assigned to your college by the Ministry of Education." />
                        </div>
                        <Input 
                            required 
                            id="College_AISHE_ID" 
                            placeholder="C-12345" 
                            className='w-80 text-sm'
                            value={formData.collegeAISHEID}
                            onChange={(e) => handleInputChange('collegeAISHEID', e.target.value)}
                        />
                    </div>

                    {/* Cycle of Accreditation */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Cycle_of_Accreditation" className="text-sm font-medium w-40">
                                Cycle of Accreditation
                            </label>
                            <InfoTooltip content="Select the current cycle of accreditation your institution is applying for or has completed with NAAC." />
                        </div>
                        <Select 
                            required 
                            value={formData.cycleOfAccreditation}
                            onValueChange={(value) => handleInputChange('cycleOfAccreditation', value)}
                        >
                            <SelectTrigger className="w-80 text-sm">
                                <SelectValue placeholder="select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cycle1">Cycle1</SelectItem>
                                <SelectItem value="Cycle2">Cycle2</SelectItem>
                                <SelectItem value="Cycle3">Cycle3</SelectItem>
                                <SelectItem value="Cycle4">Cycle4</SelectItem>
                                <SelectItem value="Cycle5">Cycle5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* College Name */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="aishe" className="text-sm font-medium w-40">
                                Name of the College as per AISHE Certificate
                            </label>
                            <InfoTooltip content="Enter the exact name of the college as mentioned in your AISHE certificate. This should match official documents." />
                        </div>
                        <Input 
                            id="aishe" 
                            placeholder="Enter College Name" 
                            className='w-80 text-sm' 
                            required 
                            maxLength={1000}
                            value={formData.collegeName}
                            onChange={(e) => handleInputChange('collegeName', e.target.value)}
                        />
                    </div>

                    {/* Establishment Date */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <Label htmlFor="date" className="text-sm font-medium w-40">
                                Date of establishment of the Institution
                            </Label>
                            <InfoTooltip content="Select the official date when the institution was established or founded. This date should match your registration documents." />
                        </div>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-80 justify-between font-light text-sm"
                                >
                                    {date ? formatDate(date) : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    captionLayout="dropdown"
                                    onSelect={(d) => {
                                        handleDateChange(d)
                                        setOpen(false)
                                    }}
                                    required
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Head of Institution */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Name_of_the_Head_of_the_Institution" className="text-sm font-medium w-40">
                                Name of the Head of the Institution
                            </label>
                            <InfoTooltip content="Enter the full name of the current head of the institution (Principal, Director, etc.)" />
                        </div>
                        <Input 
                            required 
                            id="Name_of_the_Head_of_the_Institution" 
                            placeholder="Enter Name" 
                            className='w-80 text-sm' 
                            maxLength={255}
                            value={formData.headOfInstitution}
                            onChange={(e) => handleInputChange('headOfInstitution', e.target.value)}
                        />
                    </div>

                    {/* Designation */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Designation" className="text-sm font-medium w-40">
                                Designation
                            </label>
                            <InfoTooltip content="Select the official designation of the head of the institution." />
                        </div>
                        <Select 
                            required
                            value={formData.designation}
                            onValueChange={(value) => handleInputChange('designation', value)}
                        >
                            <SelectTrigger className="w-80 text-sm">
                                <SelectValue placeholder="select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Principal">Principal</SelectItem>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="Principal In charge">Principal In charge</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Own Campus */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Does_the_college_function_from_Own_Campus" className="text-sm font-medium w-40">
                                Does the college function from Own Campus
                            </label>
                            <InfoTooltip content="Select whether the college operates from its own campus or on a leased property." />
                        </div>
                        <Select 
                            required
                            value={formData.ownCampus}
                            onValueChange={(value) => handleInputChange('ownCampus', value)}
                        >
                            <SelectTrigger className="w-80 text-sm">
                                <SelectValue placeholder="select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="On_Lease">On Lease</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Address */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Address_of_the_College" className="text-sm font-medium w-40">
                                Address of the College
                            </label>
                            <InfoTooltip content="Enter the complete postal address of the college including street, area, and locality." />
                        </div>
                        <Input 
                            required 
                            id="Address_of_the_College" 
                            placeholder="Enter Address" 
                            className='w-80 text-sm'
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                    </div>

                    {/* State */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label className="text-sm font-medium w-40">State / Union Territory</label>
                            <InfoTooltip content="Select the state or union territory where the college is located." />
                        </div>
                        <Select 
                            required 
                            onValueChange={handleStateChange}
                            value={selectedState}
                        >
                            <SelectTrigger className="w-80 text-sm">
                                <SelectValue placeholder="Select State/UT" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(indiaData)
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((state) => (
                                        <SelectItem key={state} value={state}>
                                            {state}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* District */}
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4'>
  <div className="flex items-center">
    <label htmlFor="district" className="text-sm font-medium w-40">
      District
    </label>
    <InfoTooltip content="Select the district where the college is located. Please select state first." />
  </div>
  <Select 
    required 
    disabled={!selectedState} 
    onValueChange={handleDistrictChange}
    value={selectedDistrict}
  >
    <SelectTrigger className="w-80 text-sm">
      <SelectValue placeholder={selectedState ? 'Select District' : 'Select State first'} />
    </SelectTrigger>
    <SelectContent>
      {districts
        .slice() // create a copy so original array isn’t mutated
        .sort((a, b) => a.localeCompare(b)) // ascending alphabetical order
        .map((district) => (
          <SelectItem key={district} value={district}>
            {district}
          </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


                    {/* City */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="City" className="text-sm font-medium w-40">
                                City 
                            </label>
                            <InfoTooltip content="Enter the name of the city where the college is located." />
                        </div>
                        <Input 
                            required 
                            id="City" 
                            placeholder="Enter City" 
                            className='w-80 text-sm'
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                    </div>

                    {/* Pin */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Pin" className="text-sm font-medium w-40">
                                Pin
                            </label>
                            <InfoTooltip content="Enter the 6-digit postal PIN code of the college location." />
                        </div>
                        <Input 
                            type='text' 
                            required 
                            id="Pin" 
                            placeholder="Enter Pin" 
                            className='w-80 text-sm' 
                            value={formData.pin}
                            onChange={(e) => handleNumberInputChange('pin', e.target.value, 6)}
                        />
                    </div>
                    
                    {/* Phone No */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="PhoneNo" className="text-sm font-medium w-40">
                                Phone No 
                            </label>
                            <InfoTooltip content="Enter the landline phone number of the college office." />
                        </div>
                        <Input 
                            type='text' 
                            required 
                            id="PhoneNo" 
                            placeholder="Enter Phone No" 
                            className='w-80 text-sm' 
                            value={formData.phoneNo}
                            onChange={(e) => handleNumberInputChange('phoneNo', e.target.value, 10)}
                        />
                    </div>
                      
                    {/* Fax No */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="FaxNo" className="text-sm font-medium w-40">
                                Fax No 
                            </label>
                            <InfoTooltip content="Enter the fax number of the college office if available." />
                        </div>
                        <Input 
                            type='text' 
                            required 
                            id="FaxNo" 
                            placeholder="Enter Fax No" 
                            className='w-80 text-sm' 
                            value={formData.faxNo}
                            onChange={(e) => handleInputChange('faxNo', e.target.value)}
                        />
                    </div>

                    {/* Mobile No */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="MobileNo" className="text-sm font-medium w-40">
                                Mobile No
                            </label>
                            <InfoTooltip content="Enter the mobile number of the head of institution or college office." />
                        </div>
                        <Input 
                            type='text' 
                            required 
                            id="MobileNo" 
                            placeholder="Enter Mobile No" 
                            className='w-80 text-sm' 
                            value={formData.mobileNo}
                            onChange={(e) => handleNumberInputChange('mobileNo', e.target.value, 10)}
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Email" className="text-sm font-medium w-40">
                                Email 
                            </label>
                            <InfoTooltip content="Enter the primary official email address of the college." />
                        </div>
                        <Input 
                            type='email' 
                            required 
                            id="Email" 
                            placeholder="Enter Email" 
                            className='w-80 text-sm'
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    </div>

                    {/* Alternate Email */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Alternate_Email" className="text-sm font-medium w-40">
                                Alternate Email 
                            </label>
                            <InfoTooltip content="Enter an alternate email address for the college for backup communication." />
                        </div>
                        <Input 
                            type='email' 
                            required 
                            id="Alternate_Email" 
                            placeholder="Enter Email" 
                            className='w-80 text-sm'
                            value={formData.alternateEmail}
                            onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                        />
                    </div>

                    {/* Website */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Website" className="text-sm font-medium w-40">
                                Website 
                            </label>
                            <InfoTooltip content="Enter the official website URL of the college. Include http:// or https://" />
                        </div>
                        <Input 
                            type='url' 
                            required 
                            id="Website" 
                            placeholder="Website url" 
                            className='w-80 text-sm'
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                        />
                    </div>

                    {/* Institution Age */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <label htmlFor="Institution_Age" className="text-sm font-medium w-40">
                                Has the Institution completed 6 years of existence / Years of graduation of last two batches
                            </label>
                            <InfoTooltip content="This shows the calculated age of the institution based on the establishment date. Must be at least 6 years for NAAC accreditation." />
                        </div>
                        <p className="text-sm">
                            {date ? `Age: ${getAgeInYearsAndMonths(date)}` : "Please select a date"}
                        </p>
                    </div>

                    {/* Alternate Faculty Contact Information Section */}
                    <div className="space-y-4 pt-6">
                        <div className="flex items-center">
                            <h3 className="text-md font-semibold text-gray-800 mb-4">Alternate Faculty Contact Information</h3>
                            <InfoTooltip content="Provide contact details of an alternate faculty member (such as IQAC Coordinator) who can be contacted regarding accreditation matters." />
                        </div>
                        
                        {/* Alternate Faculty Name */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_Faculty_Name" className="text-sm font-medium w-40">
                                    Alternate Faculty Name (Ex. IQAC Coordinator/IQAC Director)
                                </label>
                                <InfoTooltip content="Enter the name of an alternate contact person, typically the IQAC Coordinator or Director." />
                            </div>
                            <Input 
                                type='text' 
                                id="Alternate_Faculty_Name" 
                                placeholder="Enter Alternate Faculty Name" 
                                className='w-80 text-sm'
                                maxLength={255}
                                value={formData.alternateFacultyName}
                                onChange={(e) => handleInputChange('alternateFacultyName', e.target.value)}
                            />
                        </div>

                        {/* Alternate Address */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_Address" className="text-sm font-medium w-40">
                                    Address
                                </label>
                                <InfoTooltip content="Enter the address of the alternate faculty contact person." />
                            </div>
                            <Input 
                                type='text' 
                                id="Alternate_Address" 
                                placeholder="Enter Address" 
                                className='w-80 text-sm'
                                maxLength={255}
                                value={formData.alternateAddress}
                                onChange={(e) => handleInputChange('alternateAddress', e.target.value)}
                            />
                        </div>

                        {/* Alternate State Selector */}
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4'>
                            <div className="flex items-center">
                                <label htmlFor="alternate_state" className="text-sm font-medium w-40">
                                    State/UT
                                </label>
                                <InfoTooltip content="Select the state or union territory for the alternate faculty contact." />
                            </div>
                            <Select 
                                onValueChange={handleAlternateStateChange}
                                value={selectedAlternateState}
                            >
                                <SelectTrigger className="w-80 text-sm">
                                    <SelectValue placeholder="Select State/UT" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(indiaData).map((state) => (
                                        <SelectItem key={state} value={state}>
                                            {state}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Alternate District Selector */}
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4'>
                            <div className="flex items-center">
                                <label htmlFor="alternate_district" className="text-sm font-medium w-40">
                                    District
                                </label>
                                <InfoTooltip content="Select the district for the alternate faculty contact." />
                            </div>
                            <Select 
                                disabled={!selectedAlternateState} 
                                onValueChange={handleAlternateDistrictChange}
                                value={selectedAlternateDistrict}
                            >
                                <SelectTrigger className="w-80 text-sm">
                                    <SelectValue placeholder={selectedAlternateState ? 'Select District' : 'Select State first'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {alternateDistricts.map((district) => (
                                        <SelectItem key={district} value={district}>
                                            {district}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Alternate City */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_City" className="text-sm font-medium w-40">
                                    City 
                                </label>
                                <InfoTooltip content="Enter the city for the alternate faculty contact." />
                            </div>
                            <Input 
                                id="Alternate_City" 
                                placeholder="Enter City" 
                                className='w-80 text-sm'
                                value={formData.alternateCity}
                                onChange={(e) => handleInputChange('alternateCity', e.target.value)}
                            />
                        </div>

                        {/* Alternate Pin */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_Pin" className="text-sm font-medium w-40">
                                    Pin
                                </label>
                                <InfoTooltip content="Enter the 6-digit postal PIN code for the alternate faculty contact." />
                            </div>
                            <Input 
                                type='text' 
                                id="Alternate_Pin" 
                                placeholder="Enter Pin" 
                                className='w-80 text-sm' 
                                value={formData.alternatePin}
                                onChange={(e) => handleNumberInputChange('alternatePin', e.target.value, 6)}
                            />
                        </div>
                        
                        {/* Alternate Phone No */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_PhoneNo" className="text-sm font-medium w-40">
                                    Phone No 
                                </label>
                                <InfoTooltip content="Enter the phone number of the alternate faculty contact." />
                            </div>
                            <Input 
                                type='text' 
                                id="Alternate_PhoneNo" 
                                placeholder="Enter Phone No" 
                                className='w-80 text-sm' 
                                value={formData.alternatePhoneNo}
                                onChange={(e) => handleNumberInputChange('alternatePhoneNo', e.target.value,10)}
                            />
                        </div>
                          
                        {/* Alternate Fax No */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_FaxNo" className="text-sm font-medium w-40">
                                    Fax No 
                                </label>
                                <InfoTooltip content="Enter the fax number of the alternate faculty contact if available." />
                            </div>
                            <Input 
                                type='text' 
                                id="Alternate_FaxNo" 
                                placeholder="Enter Fax No" 
                                className='w-80 text-sm' 
                                value={formData.alternateFaxNo}
                                onChange={(e) => handleInputChange('alternateFaxNo', e.target.value)}
                            />
                        </div>

                        {/* Alternate Mobile No */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_MobileNo" className="text-sm font-medium w-40">
                                    Mobile No
                                </label>
                                <InfoTooltip content="Enter the mobile number of the alternate faculty contact." />
                            </div>
                            <Input 
                                type='text' 
                                id="Alternate_MobileNo" 
                                placeholder="Enter Mobile No" 
                                className='w-80 text-sm' 
                                value={formData.alternateMobileNo}
                                onChange={(e) => handleNumberInputChange('alternateMobileNo', e.target.value, 10)}
                            />
                        </div>

                        {/* Alternate Faculty Email */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_Faculty_Email" className="text-sm font-medium w-40">
                                    Email 
                                </label>
                                <InfoTooltip content="Enter the email address of the alternate faculty contact." />
                            </div>
                            <Input 
                                type='email' 
                                id="Alternate_Faculty_Email" 
                                placeholder="Enter Email" 
                                className='w-80 text-sm'
                                value={formData.alternateFacultyEmail}
                                onChange={(e) => handleInputChange('alternateFacultyEmail', e.target.value)}
                            />
                        </div>

                        {/* Alternate Faculty Alternate Email */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                                <label htmlFor="Alternate_Faculty_Alternate_Email" className="text-sm font-medium w-40">
                                    Alternate Email 
                                </label>
                                <InfoTooltip content="Enter an alternate email address for the alternate faculty contact." />
                            </div>
                            <Input 
                                type='email' 
                                id="Alternate_Faculty_Alternate_Email" 
                                placeholder="Enter Email" 
                                className='w-80 text-sm'
                                value={formData.alternateFacultyAlternateEmail}
                                onChange={(e) => handleInputChange('alternateFacultyAlternateEmail', e.target.value)}
                            />
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
            </div>

               
                    
                                               <div className="hidden lg:block">
                                      
                                         <Button onClick={handleSubmit} className="fixed bottom-7 right-15 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition">
                            <Save className="h-5 w-5" />
                                                  <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                                </Button>
                                </div>
        </TooltipProvider>
    )
}
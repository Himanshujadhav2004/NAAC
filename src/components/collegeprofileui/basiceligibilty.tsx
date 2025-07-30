import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export const Basiceligibilty = () => {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [selectedState, setSelectedState] = useState('')
    const [selectedDistrict, setSelectedDistrict] = useState('')
    const [districts, setDistricts] = useState<string[]>([])
    
    // Form state
    const [formData, setFormData] = useState({
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
        website: ''
    })

    const indiaData = {

       "Andaman and Nicobar Islands": [
            "Port Blair"
        ],
        "Haryana": [
            "Faridabad",
            "Gurgaon",
            "Hisar",
            "Rohtak",
            "Panipat",
            "Karnal",
            "Sonipat",
            "Yamunanagar",
            "Panchkula",
            "Bhiwani",
            "Bahadurgarh",
            "Jind",
            "Sirsa",
            "Thanesar",
            "Kaithal",
            "Palwal",
            "Rewari",
            "Hansi",
            "Narnaul",
            "Fatehabad",
            "Gohana",
            "Tohana",
            "Narwana",
            "Mandi Dabwali",
            "Charkhi Dadri",
            "Shahbad",
            "Pehowa",
            "Samalkha",
            "Pinjore",
            "Ladwa",
            "Sohna",
            "Safidon",
            "Taraori",
            "Mahendragarh",
            "Ratia",
            "Rania",
            "Sarsod"
        ],
        "Tamil Nadu": [ 
            "Chennai",
            "Coimbatore",
            "Madurai",
            "Tiruchirappalli",
            "Salem",
            "Tirunelveli",
            "Tiruppur",
            "Ranipet",
            "Nagercoil",
            "Thanjavur",
            "Vellore",
            "Kancheepuram",
            "Erode",
            "Tiruvannamalai",
            "Pollachi",
            "Rajapalayam",
            "Sivakasi",
            "Pudukkottai",
            "Neyveli (TS)",
            "Nagapattinam",
            "Viluppuram",
            "Tiruchengode",
            "Vaniyambadi",
            "Theni Allinagaram",
            "Udhagamandalam",
            "Aruppukkottai",
            "Paramakudi",
            "Arakkonam",
            "Virudhachalam",
            "Srivilliputhur",
            "Tindivanam",
            "Virudhunagar",
            "Karur",
            "Valparai",
            "Sankarankovil",
            "Tenkasi",
            "Palani",
            "Pattukkottai",
            "Tirupathur",
            "Ramanathapuram",
            "Udumalaipettai",
            "Gobichettipalayam",
            "Thiruvarur",
            "Thiruvallur",
            "Panruti",
            "Namakkal",
            "Thirumangalam",
            "Vikramasingapuram",
            "Nellikuppam",
            "Rasipuram",
            "Tiruttani",
            "Nandivaram-Guduvancheri",
            "Periyakulam",
            "Pernampattu",
            "Vellakoil",
            "Sivaganga",
            "Vadalur",
            "Rameshwaram",
            "Tiruvethipuram",
            "Perambalur",
            "Usilampatti",
            "Vedaranyam",
            "Sathyamangalam",
            "Puliyankudi",
            "Nanjikottai",
            "Thuraiyur",
            "Sirkali",
            "Tiruchendur",
            "Periyasemur",
            "Sattur",
            "Vandavasi",
            "Tharamangalam",
            "Tirukkoyilur",
            "Oddanchatram",
            "Palladam",
            "Vadakkuvalliyur",
            "Tirukalukundram",
            "Uthamapalayam",
            "Surandai",
            "Sankari",
            "Shenkottai",
            "Vadipatti",
            "Sholingur",
            "Tirupathur",
            "Manachanallur",
            "Viswanatham",
            "Polur",
            "Panagudi",
            "Uthiramerur",
            "Thiruthuraipoondi",
            "Pallapatti",
            "Ponneri",
            "Lalgudi",
            "Natham",
            "Unnamalaikadai",
            "P.N.Patti",
            "Tharangambadi",
            "Tittakudi",
            "Pacode",
            "O' Valley",
            "Suriyampalayam",
            "Sholavandan",
            "Thammampatti",
            "Namagiripettai",
            "Peravurani",
            "Parangipettai",
            "Pudupattinam",
            "Pallikonda",
            "Sivagiri",
            "Punjaipugalur",
            "Padmanabhapuram",
            "Thirupuvanam"
        ],
        "Madhya Pradesh": [
            "Indore",
            "Bhopal",
            "Jabalpur",
            "Gwalior",
            "Ujjain",
            "Sagar",
            "Ratlam",
            "Satna",
            "Murwara (Katni)",
            "Morena",
            "Singrauli",
            "Rewa",
            "Vidisha",
            "Ganjbasoda",
            "Shivpuri",
            "Mandsaur",
            "Neemuch",
            "Nagda",
            "Itarsi",
            "Sarni",
            "Sehore",
            "Mhow Cantonment",
            "Seoni",
            "Balaghat",
            "Ashok Nagar",
            "Tikamgarh",
            "Shahdol",
            "Pithampur",
            "Alirajpur",
            "Mandla",
            "Sheopur",
            "Shajapur",
            "Panna",
            "Raghogarh-Vijaypur",
            "Sendhwa",
            "Sidhi",
            "Pipariya",
            "Shujalpur",
            "Sironj",
            "Pandhurna",
            "Nowgong",
            "Mandideep",
            "Sihora",
            "Raisen",
            "Lahar",
            "Maihar",
            "Sanawad",
            "Sabalgarh",
            "Umaria",
            "Porsa",
            "Narsinghgarh",
            "Malaj Khand",
            "Sarangpur",
            "Mundi",
            "Nepanagar",
            "Pasan",
            "Mahidpur",
            "Seoni-Malwa",
            "Rehli",
            "Manawar",
            "Rahatgarh",
            "Panagar",
            "Wara Seoni",
            "Tarana",
            "Sausar",
            "Rajgarh",
            "Niwari",
            "Mauganj",
            "Manasa",
            "Nainpur",
            "Prithvipur",
            "Sohagpur",
            "Nowrozabad (Khodargama)",
            "Shamgarh",
            "Maharajpur",
            "Multai",
            "Pali",
            "Pachore",
            "Rau",
            "Mhowgaon",
            "Vijaypur",
            "Narsinghgarh"
        ],
        "Jharkhand": [
            "Dhanbad",
            "Ranchi",
            "Jamshedpur",
            "Bokaro Steel City",
            "Deoghar",
            "Phusro",
            "Adityapur",
            "Hazaribag",
            "Giridih",
            "Ramgarh",
            "Jhumri Tilaiya",
            "Saunda",
            "Sahibganj",
            "Medininagar (Daltonganj)",
            "Chaibasa",
            "Chatra",
            "Gumia",
            "Dumka",
            "Madhupur",
            "Chirkunda",
            "Pakaur",
            "Simdega",
            "Musabani",
            "Mihijam",
            "Patratu",
            "Lohardaga",
            "Tenu dam-cum-Kathhara"
        ],
        "Mizoram": [
            "Aizawl",
            "Lunglei",
            "Saiha"
        ],
        "Nagaland": [
            "Dimapur",
            "Kohima",
            "Zunheboto",
            "Tuensang",
            "Wokha",
            "Mokokchung"
        ],
        "Himachal Pradesh": [
            "Shimla",
            "Mandi",
            "Solan",
            "Nahan",
            "Sundarnagar",
            "Palampur",
            "Kullu"
        ],
        "Tripura": [
            "Agartala",
            "Udaipur",
            "Dharmanagar",
            "Pratapgarh",
            "Kailasahar",
            "Belonia",
            "Khowai"
        ],
        "Andhra Pradesh": [
            "Visakhapatnam",
            "Vijayawada",
            "Guntur",
            "Nellore",
            "Kurnool",
            "Rajahmundry",
            "Kakinada",
            "Tirupati",
            "Anantapur",
            "Kadapa",
            "Vizianagaram",
            "Eluru",
            "Ongole",
            "Nandyal",
            "Machilipatnam",
            "Adoni",
            "Tenali",
            "Chittoor",
            "Hindupur",
            "Proddatur",
            "Bhimavaram",
            "Madanapalle",
            "Guntakal",
            "Dharmavaram",
            "Gudivada",
            "Srikakulam",
            "Narasaraopet",
            "Rajampet",
            "Tadpatri",
            "Tadepalligudem",
            "Chilakaluripet",
            "Yemmiganur",
            "Kadiri",
            "Chirala",
            "Anakapalle",
            "Kavali",
            "Palacole",
            "Sullurpeta",
            "Tanuku",
            "Rayachoti",
            "Srikalahasti",
            "Bapatla",
            "Naidupet",
            "Nagari",
            "Gudur",
            "Vinukonda",
            "Narasapuram",
            "Nuzvid",
            "Markapur",
            "Ponnur",
            "Kandukur",
            "Bobbili",
            "Rayadurg",
            "Samalkot",
            "Jaggaiahpet",
            "Tuni",
            "Amalapuram",
            "Bheemunipatnam",
            "Venkatagiri",
            "Sattenapalle",
            "Pithapuram",
            "Palasa Kasibugga",
            "Parvathipuram",
            "Macherla",
            "Gooty",
            "Salur",
            "Mandapeta",
            "Jammalamadugu",
            "Peddapuram",
            "Punganur",
            "Nidadavole",
            "Repalle",
            "Ramachandrapuram",
            "Kovvur",
            "Tiruvuru",
            "Uravakonda",
            "Narsipatnam",
            "Yerraguntla",
            "Pedana",
            "Puttur",
            "Renigunta",
            "Rajam",
            "Srisailam Project (Right Flank Colony) Township"
        ],
        "Punjab": [
            "Ludhiana",
            "Patiala",
            "Amritsar",
            "Jalandhar",
            "Bathinda",
            "Pathankot",
            "Hoshiarpur",
            "Batala",
            "Moga",
            "Malerkotla",
            "Khanna",
            "Mohali",
            "Barnala",
            "Firozpur",
            "Phagwara",
            "Kapurthala",
            "Zirakpur",
            "Kot Kapura",
            "Faridkot",
            "Muktsar",
            "Rajpura",
            "Sangrur",
            "Fazilka",
            "Gurdaspur",
            "Kharar",
            "Gobindgarh",
            "Mansa",
            "Malout",
            "Nabha",
            "Tarn Taran",
            "Jagraon",
            "Sunam",
            "Dhuri",
            "Firozpur Cantt.",
            "Sirhind Fatehgarh Sahib",
            "Rupnagar",
            "Jalandhar Cantt.",
            "Samana",
            "Nawanshahr",
            "Rampura Phul",
            "Nangal",
            "Nakodar",
            "Zira",
            "Patti",
            "Raikot",
            "Longowal",
            "Urmar Tanda",
            "Morinda, India",
            "Phillaur",
            "Pattran",
            "Qadian",
            "Sujanpur",
            "Mukerian",
            "Talwara"
        ],
        "Chandigarh": [
            "Chandigarh"
        ],
        "Rajasthan": [
            "Jaipur",
            "Jodhpur",
            "Bikaner",
            "Udaipur",
            "Ajmer",
            "Bhilwara",
            "Alwar",
            "Bharatpur",
            "Pali",
            "Barmer",
            "Sikar",
            "Tonk",
            "Sadulpur",
            "Sawai Madhopur",
            "Nagaur",
            "Makrana",
            "Sujangarh",
            "Sardarshahar",
            "Ladnu",
            "Ratangarh",
            "Nokha",
            "Nimbahera",
            "Suratgarh",
            "Rajsamand",
            "Lachhmangarh",
            "Rajgarh (Churu)",
            "Nasirabad",
            "Nohar",
            "Phalodi",
            "Nathdwara",
            "Pilani",
            "Merta City",
            "Sojat",
            "Neem-Ka-Thana",
            "Sirohi",
            "Pratapgarh",
            "Rawatbhata",
            "Sangaria",
            "Lalsot",
            "Pilibanga",
            "Pipar City",
            "Taranagar",
            "Vijainagar, Ajmer",
            "Sumerpur",
            "Sagwara",
            "Ramganj Mandi",
            "Lakheri",
            "Udaipurwati",
            "Losal",
            "Sri Madhopur",
            "Ramngarh",
            "Rawatsar",
            "Rajakhera",
            "Shahpura",
            "Raisinghnagar",
            "Malpura",
            "Nadbai",
            "Sanchore",
            "Nagar",
            "Rajgarh (Alwar)",
            "Sheoganj",
            "Sadri",
            "Todaraisingh",
            "Todabhim",
            "Reengus",
            "Rajaldesar",
            "Sadulshahar",
            "Sambhar",
            "Prantij",
            "Mount Abu",
            "Mangrol",
            "Phulera",
            "Mandawa",
            "Pindwara",
            "Mandalgarh",
            "Takhatgarh"
        ],
        "Assam": [
            "Guwahati",
            "Silchar",
            "Dibrugarh",
            "Nagaon",
            "Tinsukia",
            "Jorhat",
            "Bongaigaon City",
            "Dhubri",
            "Diphu",
            "North Lakhimpur",
            "Tezpur",
            "Karimganj",
            "Sibsagar",
            "Goalpara",
            "Barpeta",
            "Lanka",
            "Lumding",
            "Mankachar",
            "Nalbari",
            "Rangia",
            "Margherita",
            "Mangaldoi",
            "Silapathar",
            "Mariani",
            "Marigaon"
        ],
        "Odisha": [
            "Bhubaneswar",
            "Cuttack",
            "Raurkela",
            "Brahmapur",
            "Sambalpur",
            "Puri",
            "Baleshwar Town",
            "Baripada Town",
            "Bhadrak",
            "Balangir",
            "Jharsuguda",
            "Bargarh",
            "Paradip",
            "Bhawanipatna",
            "Dhenkanal",
            "Barbil",
            "Kendujhar",
            "Sunabeda",
            "Rayagada",
            "Jatani",
            "Byasanagar",
            "Kendrapara",
            "Rajagangapur",
            "Parlakhemundi",
            "Talcher",
            "Sundargarh",
            "Phulabani",
            "Pattamundai",
            "Titlagarh",
            "Nabarangapur",
            "Soro",
            "Malkangiri",
            "Rairangpur",
            "Tarbha"
        ],
        "Chhattisgarh": [
            "Raipur",
            "Bhilai Nagar",
            "Korba",
            "Bilaspur",
            "Durg",
            "Rajnandgaon",
            "Jagdalpur",
            "Raigarh",
            "Ambikapur",
            "Mahasamund",
            "Dhamtari",
            "Chirmiri",
            "Bhatapara",
            "Dalli-Rajhara",
            "Naila Janjgir",
            "Tilda Newra",
            "Mungeli",
            "Manendragarh",
            "Sakti"
        ],
        "Jammu and Kashmir": [
            "Srinagar",
            "Jammu",
            "Baramula",
            "Anantnag",
            "Sopore",
            "KathUrban Agglomeration",
            "Rajauri",
            "Punch",
            "Udhampur"
        ],
        "Karnataka": [
            "Bengaluru",
            "Hubli-Dharwad",
            "Belagavi",
            "Mangaluru",
            "Davanagere",
            "Ballari",
            "Mysore",
            "Tumkur",
            "Shivamogga",
            "Raayachuru",
            "Robertson Pet",
            "Kolar",
            "Mandya",
            "Udupi",
            "Chikkamagaluru",
            "Karwar",
            "Ranebennuru",
            "Ranibennur",
            "Ramanagaram",
            "Gokak",
            "Yadgir",
            "Rabkavi Banhatti",
            "Shahabad",
            "Sirsi",
            "Sindhnur",
            "Tiptur",
            "Arsikere",
            "Nanjangud",
            "Sagara",
            "Sira",
            "Puttur",
            "Athni",
            "Mulbagal",
            "Surapura",
            "Siruguppa",
            "Mudhol",
            "Sidlaghatta",
            "Shahpur",
            "Saundatti-Yellamma",
            "Wadi",
            "Manvi",
            "Nelamangala",
            "Lakshmeshwar",
            "Ramdurg",
            "Nargund",
            "Tarikere",
            "Malavalli",
            "Savanur",
            "Lingsugur",
            "Vijayapura",
            "Sankeshwara",
            "Madikeri",
            "Talikota",
            "Sedam",
            "Shikaripur",
            "Mahalingapura",
            "Mudalagi",
            "Muddebihal",
            "Pavagada",
            "Malur",
            "Sindhagi",
            "Sanduru",
            "Afzalpur",
            "Maddur",
            "Madhugiri",
            "Tekkalakote",
            "Terdal",
            "Mudabidri",
            "Magadi",
            "Navalgund",
            "Shiggaon",
            "Shrirangapattana",
            "Sindagi",
            "Sakaleshapura",
            "Srinivaspur",
            "Ron",
            "Mundargi",
            "Sadalagi",
            "Piriyapatna",
            "Adyar"
        ],
        "Manipur": [
            "Imphal",
            "Thoubal",
            "Lilong",
            "Mayang Imphal"
        ],
        "Kerala": [
            "Thiruvananthapuram",
            "Kochi",
            "Kozhikode",
            "Kollam",
            "Thrissur",
            "Palakkad",
            "Alappuzha",
            "Malappuram",
            "Ponnani",
            "Vatakara",
            "Kanhangad",
            "Taliparamba",
            "Koyilandy",
            "Neyyattinkara",
            "Kayamkulam",
            "Nedumangad",
            "Kannur",
            "Tirur",
            "Kottayam",
            "Kasaragod",
            "Kunnamkulam",
            "Ottappalam",
            "Thiruvalla",
            "Thodupuzha",
            "Chalakudy",
            "Changanassery",
            "Punalur",
            "Nilambur",
            "Cherthala",
            "Perinthalmanna",
            "Mattannur",
            "Shoranur",
            "Varkala",
            "Paravoor",
            "Pathanamthitta",
            "Peringathur",
            "Attingal",
            "Kodungallur",
            "Pappinisseri",
            "Chittur-Thathamangalam",
            "Muvattupuzha",
            "Adoor",
            "Mavelikkara",
            "Mavoor",
            "Perumbavoor",
            "Vaikom",
            "Palai",
            "Panniyannur",
            "Guruvayoor",
            "Puthuppally",
            "Panamattom"
        ],
        "Delhi": [
            "Delhi",
            "New Delhi"
        ],
        "Dadra and Nagar Haveli": [
            "Silvassa"
        ],
        "Puducherry": [
            "Pondicherry",
            "Karaikal",
            "Yanam",
            "Mahe"
        ],
        "Uttarakhand": [
            "Dehradun",
            "Hardwar",
            "Haldwani-cum-Kathgodam",
            "Srinagar",
            "Kashipur",
            "Roorkee",
            "Rudrapur",
            "Rishikesh",
            "Ramnagar",
            "Pithoragarh",
            "Manglaur",
            "Nainital",
            "Mussoorie",
            "Tehri",
            "Pauri",
            "Nagla",
            "Sitarganj",
            "Bageshwar"
        ],
        "Uttar Pradesh": [
            "Lucknow",
            "Kanpur",
            "Firozabad",
            "Agra",
            "Meerut",
            "Varanasi",
            "Allahabad",
            "Amroha",
            "Moradabad",
            "Aligarh",
            "Saharanpur",
            "Noida",
            "Loni",
            "Jhansi",
            "Shahjahanpur",
            "Rampur",
            "Modinagar",
            "Hapur",
            "Etawah",
            "Sambhal",
            "Orai",
            "Bahraich",
            "Unnao",
            "Rae Bareli",
            "Lakhimpur",
            "Sitapur",
            "Lalitpur",
            "Pilibhit",
            "Chandausi",
            "Hardoi ",
            "Azamgarh",
            "Khair",
            "Sultanpur",
            "Tanda",
            "Nagina",
            "Shamli",
            "Najibabad",
            "Shikohabad",
            "Sikandrabad",
            "Shahabad, Hardoi",
            "Pilkhuwa",
            "Renukoot",
            "Vrindavan",
            "Ujhani",
            "Laharpur",
            "Tilhar",
            "Sahaswan",
            "Rath",
            "Sherkot",
            "Kalpi",
            "Tundla",
            "Sandila",
            "Nanpara",
            "Sardhana",
            "Nehtaur",
            "Seohara",
            "Padrauna",
            "Mathura",
            "Thakurdwara",
            "Nawabganj",
            "Siana",
            "Noorpur",
            "Sikandra Rao",
            "Puranpur",
            "Rudauli",
            "Thana Bhawan",
            "Palia Kalan",
            "Zaidpur",
            "Nautanwa",
            "Zamania",
            "Shikarpur, Bulandshahr",
            "Naugawan Sadat",
            "Fatehpur Sikri",
            "Shahabad, Rampur",
            "Robertsganj",
            "Utraula",
            "Sadabad",
            "Rasra",
            "Lar",
            "Lal Gopalganj Nindaura",
            "Sirsaganj",
            "Pihani",
            "Shamsabad, Agra",
            "Rudrapur",
            "Soron",
            "SUrban Agglomerationr",
            "Samdhan",
            "Sahjanwa",
            "Rampur Maniharan",
            "Sumerpur",
            "Shahganj",
            "Tulsipur",
            "Tirwaganj",
            "PurqUrban Agglomerationzi",
            "Shamsabad, Farrukhabad",
            "Warhapur",
            "Powayan",
            "Sandi",
            "Achhnera",
            "Naraura",
            "Nakur",
            "Sahaspur",
            "Safipur",
            "Reoti",
            "Sikanderpur",
            "Saidpur",
            "Sirsi",
            "Purwa",
            "Parasi",
            "Lalganj",
            "Phulpur",
            "Shishgarh",
            "Sahawar",
            "Samthar",
            "Pukhrayan",
            "Obra",
            "Niwai",
            "Mirzapur"
        ],
        "Bihar": [
            "Patna",
            "Gaya",
            "Bhagalpur",
            "Muzaffarpur",
            "Darbhanga",
            "Arrah",
            "Begusarai",
            "Chhapra",
            "Katihar",
            "Munger",
            "Purnia",
            "Saharsa",
            "Sasaram",
            "Hajipur",
            "Dehri-on-Sone",
            "Bettiah",
            "Motihari",
            "Bagaha",
            "Siwan",
            "Kishanganj",
            "Jamalpur",
            "Buxar",
            "Jehanabad",
            "Aurangabad",
            "Lakhisarai",
            "Nawada",
            "Jamui",
            "Sitamarhi",
            "Araria",
            "Gopalganj",
            "Madhubani",
            "Masaurhi",
            "Samastipur",
            "Mokameh",
            "Supaul",
            "Dumraon",
            "Arwal",
            "Forbesganj",
            "BhabUrban Agglomeration",
            "Narkatiaganj",
            "Naugachhia",
            "Madhepura",
            "Sheikhpura",
            "Sultanganj",
            "Raxaul Bazar",
            "Ramnagar",
            "Mahnar Bazar",
            "Warisaliganj",
            "Revelganj",
            "Rajgir",
            "Sonepur",
            "Sherghati",
            "Sugauli",
            "Makhdumpur",
            "Maner",
            "Rosera",
            "Nokha",
            "Piro",
            "Rafiganj",
            "Marhaura",
            "Mirganj",
            "Lalganj",
            "Murliganj",
            "Motipur",
            "Manihari",
            "Sheohar",
            "Maharajganj",
            "Silao",
            "Barh",
            "Asarganj"
        ],
        "Gujarat": [
            "Ahmedabad",
            "Surat",
            "Vadodara",
            "Rajkot",
            "Bhavnagar",
            "Jamnagar",
            "Nadiad",
            "Porbandar",
            "Anand",
            "Morvi",
            "Mahesana",
            "Bharuch",
            "Vapi",
            "Navsari",
            "Veraval",
            "Bhuj",
            "Godhra",
            "Palanpur",
            "Valsad",
            "Patan",
            "Deesa",
            "Amreli",
            "Anjar",
            "Dhoraji",
            "Khambhat",
            "Mahuva",
            "Keshod",
            "Wadhwan",
            "Ankleshwar",
            "Savarkundla",
            "Kadi",
            "Visnagar",
            "Upleta",
            "Una",
            "Sidhpur",
            "Unjha",
            "Mangrol",
            "Viramgam",
            "Modasa",
            "Palitana",
            "Petlad",
            "Kapadvanj",
            "Sihor",
            "Wankaner",
            "Limbdi",
            "Mandvi",
            "Thangadh",
            "Vyara",
            "Padra",
            "Lunawada",
            "Rajpipla",
            "Umreth",
            "Sanand",
            "Rajula",
            "Radhanpur",
            "Mahemdabad",
            "Ranavav",
            "Tharad",
            "Mansa",
            "Umbergaon",
            "Talaja",
            "Vadnagar",
            "Manavadar",
            "Salaya",
            "Vijapur",
            "Pardi",
            "Rapar",
            "Songadh",
            "Lathi",
            "Adalaj",
            "Chhapra",
            "Gandhinagar"
        ],
        "Telangana": [
            "Hyderabad",
            "Warangal",
            "Nizamabad",
            "Karimnagar",
            "Ramagundam",
            "Khammam",
            "Mahbubnagar",
            "Mancherial",
            "Adilabad",
            "Suryapet",
            "Jagtial",
            "Miryalaguda",
            "Nirmal",
            "Kamareddy",
            "Kothagudem",
            "Bodhan",
            "Palwancha",
            "Mandamarri",
            "Koratla",
            "Sircilla",
            "Tandur",
            "Siddipet",
            "Wanaparthy",
            "Kagaznagar",
            "Gadwal",
            "Sangareddy",
            "Bellampalle",
            "Bhongir",
            "Vikarabad",
            "Jangaon",
            "Bhadrachalam",
            "Bhainsa",
            "Farooqnagar",
            "Medak",
            "Narayanpet",
            "Sadasivpet",
            "Yellandu",
            "Manuguru",
            "Kyathampalle",
            "Nagarkurnool"
        ],
        "Meghalaya": [
            "Shillong",
            "Tura",
            "Nongstoin"
        ],
        "Himachal Praddesh": [
            "Manali"
        ],
        "Arunachal Pradesh": [
            "Naharlagun",
            "Pasighat"
        ],
        "Maharashtra": [
            "Mumbai",
            "Pune",
            "Nagpur",
            "Thane",
            "Nashik",
            "Kalyan-Dombivali",
            "Vasai-Virar",
            "Solapur",
            "Mira-Bhayandar",
            "Bhiwandi",
            "Amravati",
            "Nanded-Waghala",
            "Sangli",
            "Malegaon",
            "Akola",
            "Latur",
            "Dhule",
            "Ahmednagar",
            "Ichalkaranji",
            "Parbhani",
            "Panvel",
            "Yavatmal",
            "Achalpur",
            "Osmanabad",
            "Nandurbar",
            "Satara",
            "Wardha",
            "Udgir",
            "Aurangabad",
            "Amalner",
            "Akot",
            "Pandharpur",
            "Shrirampur",
            "Parli",
            "Washim",
            "Ambejogai",
            "Manmad",
            "Ratnagiri",
            "Uran Islampur",
            "Pusad",
            "Sangamner",
            "Shirpur-Warwade",
            "Malkapur",
            "Wani",
            "Lonavla",
            "Talegaon Dabhade",
            "Anjangaon",
            "Umred",
            "Palghar",
            "Shegaon",
            "Ozar",
            "Phaltan",
            "Yevla",
            "Shahade",
            "Vita",
            "Umarkhed",
            "Warora",
            "Pachora",
            "Tumsar",
            "Manjlegaon",
            "Sillod",
            "Arvi",
            "Nandura",
            "Vaijapur",
            "Wadgaon Road",
            "Sailu",
            "Murtijapur",
            "Tasgaon",
            "Mehkar",
            "Yawal",
            "Pulgaon",
            "Nilanga",
            "Wai",
            "Umarga",
            "Paithan",
            "Rahuri",
            "Nawapur",
            "Tuljapur",
            "Morshi",
            "Purna",
            "Satana",
            "Pathri",
            "Sinnar",
            "Uchgaon",
            "Uran",
            "Pen",
            "Karjat",
            "Manwath",
            "Partur",
            "Sangole",
            "Mangrulpir",
            "Risod",
            "Shirur",
            "Savner",
            "Sasvad",
            "Pandharkaoda",
            "Talode",
            "Shrigonda",
            "Shirdi",
            "Raver",
            "Mukhed",
            "Rajura",
            "Vadgaon Kasba",
            "Tirora",
            "Mahad",
            "Lonar",
            "Sawantwadi",
            "Pathardi",
            "Pauni",
            "Ramtek",
            "Mul",
            "Soyagaon",
            "Mangalvedhe",
            "Narkhed",
            "Shendurjana",
            "Patur",
            "Mhaswad",
            "Loha",
            "Nandgaon",
            "Warud"
        ],
        "Goa": [
            "Marmagao",
            "Panaji",
            "Margao",
            "Mapusa"
        ],
        "West Bengal": [
            "Kolkata",
            "Siliguri",
            "Asansol",
            "Raghunathganj",
            "Kharagpur",
            "Naihati",
            "English Bazar",
            "Baharampur",
            "Hugli-Chinsurah",
            "Raiganj",
            "Jalpaiguri",
            "Santipur",
            "Balurghat",
            "Medinipur",
            "Habra",
            "Ranaghat",
            "Bankura",
            "Nabadwip",
            "Darjiling",
            "Purulia",
            "Arambagh",
            "Tamluk",
            "AlipurdUrban Agglomerationr",
            "Suri",
            "Jhargram",
            "Gangarampur",
            "Rampurhat",
            "Kalimpong",
            "Sainthia",
            "Taki",
            "Murshidabad",
            "Memari",
            "Paschim Punropara",
            "Tarakeswar",
            "Sonamukhi",
            "PandUrban Agglomeration",
            "Mainaguri",
            "Malda",
            "Panchla",
            "Raghunathpur",
            "Mathabhanga",
            "Monoharpur",
            "Srirampore",
            "Adra"
        ]
    }
    const handleStateChange = (value: string) => {
        setSelectedState(value)
        setSelectedDistrict('') // Reset district when state changes
        setDistricts(indiaData[value as keyof typeof indiaData] || [])
        setFormData(prev => ({ ...prev, state: value, district: '' }))
    }

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value)
        setFormData(prev => ({ ...prev, district: value }))
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNumberInputChange = (field: string, value: string, maxLength: number) => {
        // Only allow digits and limit length
        const numericValue = value.replace(/[^0-9]/g, '')
        if (numericValue.length <= maxLength) {
            setFormData(prev => ({ ...prev, [field]: numericValue }))
        }
    }

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate)
        const dateString = selectedDate ? selectedDate.toISOString().split('T')[0] : ''
        setFormData(prev => ({ ...prev, establishmentDate: dateString }))
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Update form data with current state values
        const finalFormData = {
            ...formData,
            state: selectedState,
            district: selectedDistrict
        }
        
        console.log('Form Data:', finalFormData)
        console.log('Age of Institution:', getAgeInYearsAndMonths(date))
    }

    return (
        <div className="w-full max-w-4xl mx-auto max-h-[80vh] flex flex-col">
            <form onSubmit={handleSubmit} className="w-full overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* First field */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="College_AISHE_ID" className="text-sm font-medium w-40">
                    College AISHE ID
                </label>
                <Input 
                    required 
                    id="College_AISHE_ID" 
                    placeholder="C-12345" 
                    className='w-80 text-sm'
                    value={formData.collegeAISHEID}
                    onChange={(e) => handleInputChange('collegeAISHEID', e.target.value)}
                />
            </div>

            {/* Second field */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Cycle_of_Accreditation" className="text-sm font-medium w-40">
                    Cycle of Accreditation
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="aishe" className="text-sm font-medium w-40">
                    Name of the College as per AISHE Certificate
                </label>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">


                <Label htmlFor="date" className="text-sm font-medium w-40">
                    Date of establishment of the Institution
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-80 justify-between font-normal text-sm"
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                handleDateChange(date)
                                setOpen(false)
                            }}
                            required
                        />
                    </PopoverContent>
                </Popover>
            </div>



            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Name_of_the_Head_of_the_Institution" className="text-sm font-medium w-40">
                    Name of the Head of the Institution
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Designation" className="text-sm font-medium w-40">
                    Designation
                </label>
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
                        <SelectItem value="Principal_In_charge">Principal In charge</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Does_the_college_function_from_Own_Campus" className="text-sm font-medium w-40">
                    Does the college function from Own Campus
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Address_of_the_College" className="text-sm font-medium w-40">
                    Address of the College
                </label>
                <Input 
                    required 
                    id="Address_of_the_College" 
                    placeholder="Enter Address" 
                    className='w-80 text-sm'
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                />
            </div>



            {/* State / UT Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label className="text-sm font-medium w-40">State / Union Territory</label>
                <Select 
                    required 
                    onValueChange={handleStateChange}
                    value={selectedState}
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

            {/* District Selector */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4'>
                <label htmlFor="district" className="text-sm font-medium w-40">
                    District
                </label>
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
                        {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                                {district}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="City" className="text-sm font-medium w-40">
                    City 
                </label>
                <Input 
                    required 
                    id="City" 
                    placeholder="Enter City" 
                    className='w-80 text-sm'
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Pin" className="text-sm font-medium w-40">
                    Pin
                </label>
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
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="PhoneNo" className="text-sm font-medium w-40">
                    Phone No 
                </label>
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
              
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="FaxNo" className="text-sm font-medium w-40">
                    Fax No 
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="MobileNo" className="text-sm font-medium w-40">
                    Mobile No
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Email" className="text-sm font-medium w-40">
                    Email 
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Alternate_Email" className="text-sm font-medium w-40">
                    Alternate Email 
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Website" className="text-sm font-medium w-40">
                    Website 
                </label>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label htmlFor="Institution_Age" className="text-sm font-medium w-40">
                    Has the Institution completed 6 years of existence / Years of graduation of last two batches
                </label>
                <p className="text-sm">
                    {date ? `Age: ${getAgeInYearsAndMonths(date)}` : "Please select a date"}
                </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-6 pb-4">
                <Button type="submit" className="px-8 py-2 bg-black text-white">
                    Save
                </Button>
            </div>
        </form>
        </div>

    )
}

"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function CollegeProfile() {
  return (
    <div className="p-6">
     
      
      <Tabs defaultValue="tab1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          <TabsTrigger value="tab4">Tab 4</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Comprehensive details about academic programs and curriculum
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The college offers a diverse range of undergraduate and graduate programs designed to prepare students for successful careers in their chosen fields. Our faculty consists of experienced professionals and researchers who are committed to providing quality education and mentorship to all students.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tab2" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure & Facilities</CardTitle>
              <CardDescription>
                Overview of campus facilities and infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our campus spans over 50 acres of beautifully landscaped grounds featuring state-of-the-art laboratories, modern classrooms, and extensive library facilities. The college boasts advanced computing centers, research laboratories, and collaborative learning spaces that foster innovation and creativity among students.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The sports complex includes multiple playing fields, indoor sports facilities, and a fully equipped gymnasium. Students have access to comfortable hostel accommodations, dining facilities, and recreational areas that create a vibrant campus life experience.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tab3" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Life & Activities</CardTitle>
              <CardDescription>
                Information about student organizations and extracurricular activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Student life at our college is vibrant and diverse, with over 50 student organizations catering to various interests including cultural, technical, sports, and social causes. The college hosts numerous events throughout the year including technical symposiums, cultural festivals, sports meets, and community service initiatives.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our students actively participate in national and international competitions, winning accolades in various fields. The college encourages leadership development through various programs and provides platforms for students to showcase their talents and develop essential life skills beyond academics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tab4" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Research & Innovation</CardTitle>
              <CardDescription>
                Details about research initiatives and innovation programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The college is committed to fostering a culture of research and innovation. Our research centers focus on cutting-edge technologies including artificial intelligence, renewable energy, biotechnology, and sustainable development. Faculty and students collaborate on projects that address real-world challenges and contribute to scientific advancement.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We have established partnerships with leading industries and research institutions worldwide, providing students with opportunities to work on collaborative projects and gain exposure to global research practices. The college regularly publishes research papers in reputed journals and presents findings at international conferences.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CollegeProfile

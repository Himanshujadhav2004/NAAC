"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Basiceligibilty } from "./collegeprofileui/basiceligibilty"
import { Affiliationdetials } from "./collegeprofileui/affiliationdetials"
import { Academicprograms } from "./collegeprofileui/academicprograms"

function CollegeProfile() {
  return (
    <div className="p-6">
     
      
      <Tabs defaultValue="tab1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tab1">Basic Eligibility </TabsTrigger>
          <TabsTrigger value="tab2">Affiliation details</TabsTrigger>
          <TabsTrigger value="tab3">Academic Programs </TabsTrigger>
          <TabsTrigger value="tab4">Quality Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1" className="mt-6">
          <Card>
            {/* <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
             
              </CardDescription>
            </CardHeader> */}
            <CardContent className="w-full">
              <Basiceligibilty></Basiceligibilty>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tab2" className="mt-6">
          <Card>
            {/* <CardHeader>
              <CardTitle>Infrastructure & Facilities</CardTitle>
              <CardDescription>
                Overview of campus facilities and infrastructure
              </CardDescription>
            </CardHeader> */}
            <CardContent className="w-full">
          <Affiliationdetials></Affiliationdetials>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tab3" className="mt-6">
          <Card>
            {/* <CardHeader>
              <CardTitle>Student Life & Activities</CardTitle>
              <CardDescription>
                Information about student organizations and extracurricular activities
              </CardDescription>
            </CardHeader> */}
            <CardContent className="w-full">
             <Academicprograms></Academicprograms>
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

"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Basiceligibilty } from "./collegeprofileui/basiceligibilty"
import { Affiliationdetials } from "./collegeprofileui/affiliationdetials"
import { Academicprograms } from "./collegeprofileui/academicprograms"
import { Qualityinformation } from "./collegeprofileui/qualityinformation"

function CollegeProfile() {
  return (
    <div className="p-4 sm:p-6">
      <Tabs defaultValue="tab1" className="w-full">
        
        {/* Responsive TabsList */}
        <div className="overflow-x-auto">
          <TabsList
            className="flex sm:grid sm:grid-cols-4 gap-2 min-w-max sm:min-w-0"
          >
            <TabsTrigger value="tab1" className="flex-1 whitespace-nowrap">
              Basic Eligibility
            </TabsTrigger>
            <TabsTrigger value="tab2" className="flex-1 whitespace-nowrap">
              Affiliation details
            </TabsTrigger>
            <TabsTrigger value="tab3" className="flex-1 whitespace-nowrap">
              Academic Programs
            </TabsTrigger>
            <TabsTrigger value="tab4" className="flex-1 whitespace-nowrap">
              Quality Information
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1 */}
        <TabsContent value="tab1" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Basiceligibilty />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2 */}
        <TabsContent value="tab2" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Affiliationdetials />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3 */}
        <TabsContent value="tab3" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Academicprograms />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4 */}
        <TabsContent value="tab4" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Qualityinformation />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CollegeProfile

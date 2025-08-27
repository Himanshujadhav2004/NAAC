"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Basiceligibilty } from "./collegeprofileui/basiceligibilty"
import { Affiliationdetials } from "./collegeprofileui/affiliationdetials"
import { Academicprograms } from "./collegeprofileui/academicprograms"
import { Qualityinformation } from "./collegeprofileui/qualityinformation"
import axios from 'axios'

function CollegeProfile() {
  // ✅ Single API call state management for all 4 tabs
const [data1, setData1] = useState(null) // Basic Eligibility
const [data2, setData2] = useState(null) // Affiliation Details
const [data3, setData3] = useState(null) // Academic Programs
const [data4, setData4] = useState(null) // Quality Information
const [loading, setLoading] = useState(true)
const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // ✅ Fetch data once when component mounts
useEffect(() => {
  const fetchAllTabsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/answers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // API returns array: [{tab1_data}, {tab2_data}, {tab3_data}, {tab4_data}]
      const apiResponseArray = response.data;
      
      setData1(apiResponseArray[0] || null); // Basic Eligibility
      setData2(apiResponseArray[1] || null); // Affiliation Details  
      setData3(apiResponseArray[2] || null); // Academic Programs
      setData4(apiResponseArray[3] || null); // Quality Information
      
      setLoading(false);
      
      console.log("📥 API Data fetched for all tabs:", {
        data1: apiResponseArray[0],
        data2: apiResponseArray[1], 
        data3: apiResponseArray[2],
        data4: apiResponseArray[3]
      });
    } catch (error: unknown) {
      console.error("Error fetching data:", error);


      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }

      setLoading(false);
    }
  };

  fetchAllTabsData();
}, [refreshTrigger]); // Changed from [] to [refreshTrigger]

  // ✅ Show loading state
  // if (loading) {
  //   return (
  //     <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading college profile data...</p>
  //       </div>
  //     </div>
  //   );
  // }
const handleDataRefresh = () => {
  setRefreshTrigger(prev => prev + 1);
};
  // ✅ Show error state
  // if (error) {
  //   return (
  //     <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
  //       <div className="text-center text-red-600">
  //         <p>Error loading data. Please refresh the page.</p>
  //       </div>
  //     </div>
  //   );
  // }

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

        {/* ✅ Pass specific data to each tab component */}
        <TabsContent value="tab1" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Basiceligibilty data={data1} onDataUpdate={handleDataRefresh}/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tab2" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Affiliationdetials data={data2} onDataUpdate={handleDataRefresh} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tab3" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Academicprograms data={data3} onDataUpdate={handleDataRefresh}/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tab4" className="mt-6">
          <Card>
            <CardContent className="w-full">
              <Qualityinformation data={data4} onDataUpdate={handleDataRefresh}/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CollegeProfile
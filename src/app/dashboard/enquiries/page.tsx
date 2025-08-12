"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Space, Button, Tag, Spin } from "antd";
import { MailOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { AssignTutorModal } from "@/components/AssignTutorModal";
import { supabaseClient } from "@/lib/supabase";
import { Enquiry } from "@/types";
import formatUkDate from "@/utils/FormatUkDate";


export default function EnquiriesList() {
  console.log("🔥 EnquiriesList component is rendering!");
  console.log("🔧 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("🔑 Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const { data: enquiries, isLoading, error } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      console.log("🚀 Starting Supabase queries...");
      
      const { data: bookingOwners, error: bookingOwnersError } = await supabaseClient
        .from("booking_owners")
        .select("*");
      console.log("📊 Booking owners data:", bookingOwners);
      console.log("❌ Booking owners error:", bookingOwnersError);

      const { data: students, error: studentsError } = await supabaseClient
        .from("students")
        .select("*");
      console.log("👥 Students data:", students);
      console.log("❌ Students error:", studentsError);

      if (bookingOwnersError || studentsError) {
        const errorMsg = bookingOwnersError?.message || studentsError?.message;
        console.error("💥 Throwing error:", errorMsg);
        throw new Error(errorMsg);
      }

      const combined = [...(bookingOwners || []), ...(students || [])];
      console.log("✅ Combined enquiries:", combined);
      return combined;
    },
  });


  console.log("📋 Current React Query state:");
  console.log("  - enquiries:", enquiries);
  console.log("  - isLoading:", isLoading);
  console.log("  - error:", error);

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const handleAssign = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setAssignModalVisible(true);
  };

  const handleAssignSuccess = () => {
    setAssignModalVisible(false);
    setSelectedEnquiry(null);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading enquiries: {(error as Error).message}</div>;
  }

  return (
    <div>
      <h1 className="p-2">Active Enquiries</h1>
      
      {isLoading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      )}

      {!isLoading && !error && (
        <Table dataSource={enquiries} rowKey="id">
          <Table.Column dataIndex="first_name" title="First Name" />
          <Table.Column dataIndex="last_name" title="Last Name" />
          <Table.Column dataIndex="email" title="Email" />
          <Table.Column dataIndex="postcode" title="Postcode" />
          <Table.Column
            dataIndex="status"
            title="Status"
            render={(status) => {
              const colors = {
                new: "blue",
                assigned: "orange",
                expired: "red",
                completed: "green",
              };
              return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
            }}
          />
          <Table.Column
            dataIndex={["tutor_id"]}
            title="Assigned Tutor"
            render={(value) => {
              return value ? `Tutor ID: ${value}` : "Unassigned";
            }}
          />
          <Table.Column
            dataIndex="created_at"
            title="Created At"
            render={(value) => formatUkDate(value)}
          />
          <Table.Column
            title="Actions"
            dataIndex="actions"
            render={(_, record) => (
              <Space>
                {record.status === "new" && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<MailOutlined />}
                    onClick={() => handleAssign(record as Enquiry)}
                  >
                    Assign
                  </Button>
                )}
                <Button 
                  icon={<EditOutlined />} 
                  size="small" 
                  onClick={() => {/* Add edit logic */}}
                />
                <Button 
                  icon={<EyeOutlined />} 
                  size="small" 
                  onClick={() => {/* Add view logic */}}
                />
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger
                  onClick={() => {/* Add delete logic */}}
                />
              </Space>
            )}
          />
        </Table>
      )}

      {selectedEnquiry && (
        <AssignTutorModal
          enquiry={selectedEnquiry}
          visible={assignModalVisible}
          onCancel={() => setAssignModalVisible(false)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
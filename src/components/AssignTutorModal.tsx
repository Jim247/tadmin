"use client";

import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { Enquiry } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import { parseInstruments } from "@/utils/parseInstrumentArray";
import { useQuery } from "@tanstack/react-query";
import { Typography, Select, message, Modal, Button, Space, Card } from "antd";
import { useState } from "react";

const { Text, Title } = Typography;
const { Option } = Select;

interface Tutor {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  instruments: string;
  location: string;
  postcode: string;
  strikes?: number;
}

interface AssignTutorModalProps {
  enquiry: Enquiry;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}


export const AssignTutorModal: React.FC<AssignTutorModalProps> = ({
  enquiry,
  visible,
  onCancel,
  onSuccess,
}) => {
  const [selectedTutor, setSelectedTutor] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Fetch tutors using React Query
  const { data: tutorsData, isLoading: tutorsLoading } = useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("tutors").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  console.log("Fetched tutors data:", tutorsData);
  console.log("All tutors:", tutorsData);
  console.log("Tutors loading:", tutorsLoading);

  // Filtering tutors by matching any instrument in student's array with tutor's array
  const filteredTutors = tutorsData?.filter((tutor: Tutor) => {
    const tutorInstruments = parseInstruments(tutor.instruments);
    const studentInstruments = Array.isArray(enquiry.instruments)
      ? enquiry.instruments
      : [enquiry.instruments];
    // Check if any instrument matches
    return studentInstruments.some(instr => tutorInstruments.includes(instr));
  }) || [];

  console.log("Filtered tutors:", filteredTutors);
  console.log("Looking for instrument:", enquiry?.instruments);  const handleAssign = async () => {
    if (!selectedTutor) {
      message.error("Please select a tutor");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabaseClient
        .from("booking_owners")
        .update({ tutor_id: selectedTutor })
        .eq("id", enquiry.id);

      if (error) {
        throw error;
      }

      message.success("Tutor assigned successfully!");
      onSuccess();
      setSelectedTutor(undefined);
    } catch (error) {
      console.error("Assignment error:", error);
      message.error("Failed to assign tutor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Assign Tutor to Enquiry"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="assign"
          type="primary"
          icon={<MailOutlined />}
          loading={loading}
          onClick={handleAssign}
          disabled={!selectedTutor}
        >
          Assign & Send Emails
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card size="small">
          <Title level={5}>Enquiry Details</Title>
          <Text><strong>Booking Owner:</strong> {enquiry?.first_name}{" "}{enquiry?.last_name}</Text><br />
          <Text><strong>Email:</strong> {enquiry?.email}</Text><br />
          <Text><strong>Instrument:</strong> {enquiry?.instrument}</Text><br />
          <Text><strong>Level:</strong> {enquiry?.level}</Text><br />
          <Text><strong>Location:</strong> {enquiry?.location}</Text><br />
          {enquiry?.message && (
            <>
              <Text><strong>Message:</strong></Text><br />
              <Text>{enquiry.message}</Text>
            </>
          )}
        </Card>

        <div>
          <Title level={5}>Select Tutor</Title>
          <Text type="secondary">
          
          </Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Select a tutor"
            loading={tutorsLoading}
            value={selectedTutor}
            onChange={setSelectedTutor}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                ?.includes(input.toLowerCase())
            }
          >
            {filteredTutors?.map((tutor: Tutor) => (
              <Option key={tutor.id} value={tutor.id}>
                <Space>
                  <UserOutlined />
                  {tutor.name} - {tutor.postcode}
                </Space>
              </Option>
            ))}
          </Select>
          {filteredTutors?.length === 0 && !tutorsLoading && (
            <Text type="warning">
              No active tutors found for {enquiry?.instrument}
            </Text>
          )}
        </div>

        <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
          <Text type="success">
            <MailOutlined /> After assignment, emails will be sent to:
          </Text>
          <ul>
            <li>Student confirmation email</li>
            <li>Tutor assignment notification (24h to respond)</li>
          </ul>
        </Card>
      </Space>
    </Modal>
  );
};

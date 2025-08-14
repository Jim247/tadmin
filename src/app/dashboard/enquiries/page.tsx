"use client";

import { useState } from "react";
import { useEnquiries, useTutors } from "@/hooks/useEnquiriesAndTutors";
import { Table, Space, Button, Tag, Spin, Modal, List, message } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { AssignTutorModal } from "@/components/AssignTutorModal";
import { Enquiry, Student } from "@/constants/types";
import formatUkDate from "@/utils/FormatUkDate";
import { getStudentCount } from "@/utils/aggregation-functions";
import { supabaseClient } from "@/lib/supabase";


export default function EnquiriesList() {
  const { data: enquiries, isLoading, error } = useEnquiries();
  const { data: tutors } = useTutors();


  // Remove tutors state and fetchTutors logic, use tutors from hook
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const [filters, setFilters] = useState({
    status: "all", // "active", "inactive", or "all"
    assigned: "all", // "assigned", "unassigned", or "all"
  });



  const handleAssignClick = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setAssignModalVisible(true);
  };

  const handleTutorSelect = async (tutorId: string) => {
    if (!selectedEnquiry) return;

    const { error } = await supabaseClient
      .from("booking_owners")
      .update({ tutor_id: tutorId })
      .eq("id", selectedEnquiry.id);

    if (error) {
      console.error("Error assigning tutor:", error);
    } else {
      message.success("Tutor assigned successfully!");
      setAssignModalVisible(false);
      setSelectedEnquiry(null);
      // Optionally refetch enquiries
    }
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

  const filteredEnquiries = enquiries?.filter((enquiry) => {
    const statusMatch =
      filters.status === "all" || enquiry.status === filters.status;
    const assignedMatch =
      filters.assigned === "all" ||
      (filters.assigned === "assigned" && enquiry.tutor_id) ||
      (filters.assigned === "unassigned" && !enquiry.tutor_id);

    return statusMatch && assignedMatch;
  });

  return (
    <div>
      <h1 className="p-2">Active Enquiries</h1>
      <div style={{ marginBottom: 16 }}>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filters.assigned}
          onChange={(e) => setFilters({ ...filters, assigned: e.target.value })}
        >
          <option value="all">All Assignments</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <Button onClick={() => setFilters({ status: "all", assigned: "all" })}>
          Clear Filters
        </Button>
      </div>
      <Table
        dataSource={filteredEnquiries}
        rowKey={record => record.student_id || record.id}
        expandable={{
          expandedRowRender: (record) => (
            Array.isArray(record.students) && record.students.length > 0 ? (
              <div>
                <strong>Students:</strong>
                <ul style={{ marginTop: 8 }}>
                  {record.students.map((student: Student) => (
                    <li key={student.id} style={{ marginBottom: 8 }}>
                      <strong>{student.name}</strong> - {Array.isArray(student.instruments) ? student.instruments.join(", ") : student.instruments}
                      <br />Assigned Tutor: {student.tutor_id ? student.tutor_id : "Unassigned"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : <span>No students linked</span>
          ),
          rowExpandable: (record) => Array.isArray(record.students) && record.students.length > 0,
          expandRowByClick: true,
        }}
      >
        <Table.Column 
          title="Booking Owner" 
          render={(_, record) => `${record.first_name} ${record.last_name}`}
        />
  
        <Table.Column dataIndex="email" title="Contact Email" />
        <Table.Column dataIndex="phone" title="Phone" />
        <Table.Column dataIndex="postcode" title="Postcode" />
        <Table.Column 
          dataIndex="instruments" 
          title="Instrument(s)"
          render={(instruments) => {
            if (!instruments || instruments === 'Not specified') return 'Booking Owner';
            // Split instruments string into array, remove duplicates, and render as chips
            const uniqueInstruments = Array.from(new Set((instruments as string).split(',').map((instr: string) => instr.trim())));
            return uniqueInstruments.map((instr: string) => (
              <Tag
                key={instr}
                color="blue"
                style={{
                  marginRight: 8,
                  marginBottom: 6,
                  padding: '4px 12px',
                  fontSize: '1em',
                  display: 'inline-block'
                }}
              >
                {instr}
              </Tag>
            ));
          }}
        />
        <Table.Column 
          dataIndex="level" 
          title="Level"
          render={(level) => level || 'Not specified'}
        />
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
          dataIndex={"tutor_id"}
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
        title="Number of Students"
        render={(_, record) => getStudentCount(record)}
      />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              {!record.tutor_id && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleAssignClick(record as Enquiry)}
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

      <Modal
        title="Assign Tutor"
        open={assignModalVisible} // Updated from `visible` to `open`
        onCancel={() => setAssignModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={tutors}
          renderItem={(tutor) => (
            <List.Item>
              <Button type="link" onClick={() => handleTutorSelect(tutor.id)}>
                {tutor.name}
              </Button>
            </List.Item>
          )}
        />
      </Modal>

      {selectedEnquiry && (
        <AssignTutorModal
          enquiry={selectedEnquiry as Enquiry}
          visible={assignModalVisible}
          onCancel={() => setAssignModalVisible(false)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
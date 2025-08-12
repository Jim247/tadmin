"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Space, Button, Tag, Spin, Modal, List, message } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { AssignTutorModal } from "@/components/AssignTutorModal";
import { supabaseClient } from "@/lib/supabase";
import { Enquiry } from "@/types";
import formatUkDate from "@/utils/FormatUkDate";


interface Tutor {
  id: number;
  name: string;
}

export default function EnquiriesList() {
  const { data: enquiries, isLoading, error } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      // Get booking owners with their related students
      const { data: bookingOwners, error: bookingOwnersError } = await supabaseClient
        .from("booking_owners")
        .select(`
          *,
          students(*)
        `);

      if (bookingOwnersError) {
        throw new Error(bookingOwnersError.message);
      }

      // Transform the data to create enquiry records
      const enquiries = (bookingOwners || []).map(owner => {
        // If there are students, create an enquiry for each student
        if (owner.students && owner.students.length > 0) {
          return owner.students.map(student => ({
            ...owner,
            student_id: student.id,
            student_first_name: student.first_name,
            student_last_name: student.last_name,
            student_age: student.age,
            instrument: student.instrument || student.instruments, // Handle both field names
            level: student.level,
            is_self_booking: false,
            booking_type: 'parent_for_child'
          }));
        } else {
          // No linked students - booking owner is the student
          return [{
            ...owner,
            student_id: owner.id,
            student_first_name: owner.first_name,
            student_last_name: owner.last_name,
            student_age: owner.age,
            instrument: owner.instrument || owner.instruments, // Handle both field names
            level: owner.level,
            is_self_booking: true,
            booking_type: 'self_booking'
          }];
        }
      }).flat();

      return enquiries;
    },
  });


  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const [filters, setFilters] = useState({
    status: "all", // "active", "inactive", or "all"
    assigned: "all", // "assigned", "unassigned", or "all"
  });

  const fetchTutors = async () => {
    const { data, error } = await supabaseClient.from("tutors").select("*");
    if (error) {
      console.error("Error fetching tutors:", error);
    } else {
      setTutors(data || []);
    }
  };

  const handleAssignClick = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setAssignModalVisible(true);
    fetchTutors();
  };

  const handleTutorSelect = async (tutorId: number) => {
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

      <Table dataSource={filteredEnquiries} rowKey="id">
        <Table.Column 
          title="Booking Owner" 
          render={(_, record) => `${record.first_name} ${record.last_name}`}
        />
        <Table.Column 
          title="Student" 
          render={(_, record) => (
            <div>
              <div>{record.student_first_name} {record.student_last_name}</div>
              <small style={{ color: '#666' }}>
                {record.is_self_booking ? '(Self)' : '(Child)'}
              </small>
            </div>
          )}
        />
        <Table.Column dataIndex="email" title="Contact Email" />
        <Table.Column dataIndex="phone" title="Phone" />
        <Table.Column dataIndex="postcode" title="Postcode" />
        <Table.Column 
          dataIndex="instrument" 
          title="Instrument"
          render={(instrument) => instrument || 'Not specified'}
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
          enquiry={selectedEnquiry}
          visible={assignModalVisible}
          onCancel={() => setAssignModalVisible(false)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
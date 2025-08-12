"use client";

import { Refine } from "@refinedev/core";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { RefineThemes, ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import { ConfigProvider, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import routerProvider from "@refinedev/nextjs-router";
import { supabaseClient } from "@/lib/supabase";
import { AuthWrapper } from "@/components/AuthWrapper";
import "@refinedev/antd/dist/reset.css";

export default function DashboardPage() {
  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <AuthWrapper>
      <ConfigProvider theme={RefineThemes.Blue}>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          routerProvider={routerProvider}
          notificationProvider={useNotificationProvider}
          resources={[
            { 
              name: "enquiries", 
              list: "/dashboard/enquiries", 
              show: "/dashboard/enquiries/show/:id", 
              edit: "/dashboard/enquiries/edit/:id", 
              meta: { canDelete: true } 
            },
            { 
              name: "tutors", 
              list: "/dashboard/tutors", 
              show: "/dashboard/tutors/show/:id", 
              edit: "/dashboard/tutors/edit/:id", 
              create: "/dashboard/tutors/create", 
              meta: { canDelete: true } 
            },
            { 
              name: "students", 
              list: "/dashboard/students", 
              show: "/dashboard/students/show/:id", 
              edit: "/dashboard/students/edit/:id", 
              meta: { canDelete: true } 
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <ThemedLayoutV2
            Header={() => (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0 24px',
                background: '#fff',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <h1 style={{ margin: 0 }}>Tutor Management Dashboard</h1>
                <Button 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                  type="text"
                >
                  Logout
                </Button>
              </div>
            )}
          >
            <div style={{ padding: "24px" }}>
              <h2>Welcome to your admin portal</h2>
              <p>Manage tutors, students, and enquiries with full oversight and email control.</p>
            </div>
          </ThemedLayoutV2>
        </Refine>
      </ConfigProvider>
    </AuthWrapper>
  );
}

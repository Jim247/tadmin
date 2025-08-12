"use client";

import { Refine } from "@refinedev/core";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { RefineThemes, ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import { ConfigProvider } from "antd";
import routerProvider from "@refinedev/nextjs-router";

import { supabaseClient } from "@/lib/supabase";

import "@refinedev/antd/dist/reset.css";

export default function Home() {
  return (
    <ConfigProvider theme={RefineThemes.Blue}>
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        liveProvider={liveProvider(supabaseClient)}
        routerProvider={routerProvider}
        notificationProvider={useNotificationProvider}
        resources={[
          {
            name: "enquiries",
            list: "/enquiries",
            show: "/enquiries/show/:id",
            edit: "/enquiries/edit/:id",
            meta: {
              canDelete: true,
            },
          },
          {
            name: "tutors",
            list: "/tutors",
            show: "/tutors/show/:id",
            edit: "/tutors/edit/:id",
            create: "/tutors/create",
            meta: {
              canDelete: true,
            },
          },
          {
            name: "students",
            list: "/students",
            show: "/students/show/:id",
            edit: "/students/edit/:id",
            meta: {
              canDelete: true,
            },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <ThemedLayoutV2>
          <div style={{ padding: "24px" }}>
            <h1>Tutor Management Dashboard</h1>
            <p>Welcome to your admin portal for managing tutors, students, and enquiries.</p>
          </div>
        </ThemedLayoutV2>
      </Refine>
    </ConfigProvider>
  );
}

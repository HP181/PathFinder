"use client";

import React from "react";
import { MenteeList } from "@/components/Matching/MenteeList";

const Page = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Connected Mentees</h1>
      <MenteeList />
    </div>
  );
};

export default Page;

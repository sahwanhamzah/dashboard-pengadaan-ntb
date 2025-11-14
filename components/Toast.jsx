"use client";
import { useState } from "react";

export default function Toast({ message, type }) {
  if (!message) return null;

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded shadow 
        ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
      {message}
    </div>
  );
}

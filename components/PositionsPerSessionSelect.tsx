"use client";
import { useState } from "react";
export default function PositionsPerSessionSelect() {
  const [value, setValue] = useState(
    () => localStorage.getItem("positionsPerSession") ?? "all",
  );
  return (
    <select
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        localStorage.setItem("positionsPerSession", e.target.value);
      }}
      className="border border-gray-300 px-2 py-1 rounded-lg text-gray-900 focus:ring-2 focus:outline-none transition duration-150 ease-in-out focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="30">30</option>
      <option value="50">50</option>
      <option value="all">All</option>
    </select>
  );
}

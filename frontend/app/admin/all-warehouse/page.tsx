"use client";
import { WarehouseApi } from "@/api/warehouse";
import { GetWarehouseFilter } from "@/types/warehouse";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const AllWarehouseManagement = () => {
  const [filter, setFilter] = useState<GetWarehouseFilter>({
    page: 1,
    searchKey: "",
  });
  const { data: warehouseList } = useQuery({
    queryKey: ["all-warehouse", filter],
    queryFn: async () => await WarehouseApi.getWarehouses(),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>name</th>
              <th>location</th>
              <th>desc</th>
              <th>isActive</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            <tr>
              <td>Clay Ganderton</td>
              <td>Quality Control Specialist</td>
              <td>Blue</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllWarehouseManagement;

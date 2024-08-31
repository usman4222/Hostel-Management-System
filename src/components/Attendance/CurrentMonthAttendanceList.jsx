import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DefaultLayout from "../../layout/DefaultLayout";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { db } from "../../firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { IconButton } from "@mui/material";
import { MdEdit } from "react-icons/md";
import EditAttendanceDialog from "./EditAttendanceDialog";
import { useSnackbar } from "notistack";
import { onSnapshot } from "firebase/firestore";
import StudentSearchAttendanceGraph from "../../Charts/StudentSearchAttendanceGraph";
import Spinner from "../Spinner";

const CurrentMonthAttendanceList = () => {
  const [attendanceArray, setAttendanceArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userAttendance, setUserAttendance] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const { userId } = useParams();

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
      const unsubscribe = fetchUserAttendance(
        userId,
        selectedMonth,
        selectedYear
      );
      return () => unsubscribe();
    }
  }, [userId, selectedMonth, selectedYear]);

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, "students", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserName(userData.name || "No Name");
        setRegNo(userData.regNo || "No Reg No");
        setStudentClass(userData.studentClass || "No Class");
      } else {
        setUserName("No Name");
        setRegNo("No Reg No");
        setStudentClass("No Class");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const fetchUserAttendance = (userId, month, year) => {
    setLoading(true);
    const docRef = doc(db, "attendance", userId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const attendanceData = docSnap.data().attendance || [];
          const filteredAttendance = filterAttendanceByMonth(
            attendanceData,
            month,
            year
          );
          setAttendanceArray(filteredAttendance);
        } else {
          setAttendanceArray([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching attendance details: ", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  };

  const filterAttendanceByMonth = (attendanceData, month, year) => {
    return attendanceData.filter((record) => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();
      return recordMonth === month && recordYear === year;
    });
  };

  const handleMonthChange = (event) => {
    const [year, month] = event.target.value.split("-");
    setSelectedYear(parseInt(year, 10));
    setSelectedMonth(parseInt(month, 10) - 1);
  };

  const getMonthName = (monthIndex) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex];
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const processAttendanceData = (attendance) => {
    const counts = { presentCount: 0, absentCount: 0, leaveCount: 0 };
    attendance.forEach((record) => {
      if (record.status === "Present") counts.presentCount++;
      if (record.status === "Absent") counts.absentCount++;
      if (record.status === "Leave") counts.leaveCount++;
    });
    const totalEntries = attendance.length;
    const presentPercentage = totalEntries
      ? ((counts.presentCount / totalEntries) * 100).toFixed(2)
      : 0;
    return { ...counts, totalEntries, presentPercentage };
  };

  const attendanceData = processAttendanceData(attendanceArray);

  const handleUpdate = async (updatedRecord) => {
    const normalizeDate = (date) => new Date(date).toISOString().split("T")[0];
    const normalizedUpdatedDate = normalizeDate(updatedRecord.date);
    
    try {
        const attendanceRef = doc(db, "attendance", userId);
        const attendanceSnap = await getDoc(attendanceRef);

        if (attendanceSnap.exists()) {
            const currentAttendance = attendanceSnap.data().attendance || [];
            
            const recordIndex = currentAttendance.findIndex((record) => {
                const normalizedRecordDate = normalizeDate(record.date);
                return record.userId === updatedRecord.userId && normalizedRecordDate === normalizedUpdatedDate;
            });

            if (recordIndex !== -1) {
                currentAttendance[recordIndex] = { ...updatedRecord, date: normalizedUpdatedDate };
            } else {
                currentAttendance.push({ ...updatedRecord, date: normalizedUpdatedDate });
            }

            await updateDoc(attendanceRef, { attendance: currentAttendance });

            enqueueSnackbar("Attendance record updated successfully", { variant: "success" });
        } else {
            enqueueSnackbar("Attendance record not found", { variant: "warning" });
        }
    } catch (error) {
        console.error("Error updating attendance record:", error);
        enqueueSnackbar("Failed to update attendance record", { variant: "error" });
    }

    setOpenDialog(false);
};


  return (
    <DefaultLayout>
      <Breadcrumb pageName="Employees Attendance Table" />
      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="flex md:justify-between md:flex-row flex-col">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              {getMonthName(selectedMonth)} {selectedYear} Attendance List{" "}
              <span className="dark:bg-black px-2 mr-2">Name:</span>
              <span className="text-[#E1D9D1]">{userName}, </span>
              <span className="dark:bg-black px-2 mr-2">Reg No:</span>
              <span className="text-[#E1D9D1]">{regNo}, </span>
              <span className="dark:bg-black px-2 mr-2">Class:</span>
              <span className="text-[#E1D9D1]">{studentClass} </span>
            </h4>
            <div className="flex items-center md:pb-5">
              <input
                type="month"
                className="p-2 border rounded"
                onChange={handleMonthChange}
                value={`${selectedYear}-${String(selectedMonth + 1).padStart(
                  2,
                  "0"
                )}`}
              />
            </div>
          </div>
          <div className="max-w-full overflow-x-auto pb-5">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-black dark:text-white"><Spinner/></p>
              </div>
            ) : (
              <table className="w-full table-auto ">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Date
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Status
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Reason
                    </th>
                    <th className="min-w-[50px] py-4 px-4 font-medium text-black dark:text-white">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceArray.length > 0 ? (
                    attendanceArray.map((record, index) => (
                      <tr key={index}>
                        <td className="border-b border-[#eee] py-5 px-4 text-black dark:border-strokedark dark:text-white">
                          {record.date}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 text-black dark:border-strokedark dark:text-white">
                          {record.status}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 text-black dark:border-strokedark dark:text-white">
                          {record.reason}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <IconButton onClick={() => handleEditClick(record)}>
                            <MdEdit className="text-black dark:text-white hover:text-primary" />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-5 px-4 text-black dark:text-white"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {attendanceArray.length > 0 ? (
          <div className="max-w-full overflow-x-auto lg:overflow-x-hidden dark:bg-boxdark p-7">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Present
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Absent
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Leave
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Total Days
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Present Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <p className="text-black dark:text-white">
                      {attendanceData.presentCount}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {attendanceData.absentCount}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {attendanceData.leaveCount}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {attendanceData.totalEntries}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {attendanceData.presentPercentage}%
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="pt-10">
              <StudentSearchAttendanceGraph userAttendance={attendanceData} />
            </div>
          </div>
        ) : (
          <div className="text-center text-black dark:text-white py-4">
            No data found to display the graph.
          </div>
        )}
      </div>
      <EditAttendanceDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        record={selectedRecord}
        onUpdate={handleUpdate}
      />
    </DefaultLayout>
  );
};

export default CurrentMonthAttendanceList;

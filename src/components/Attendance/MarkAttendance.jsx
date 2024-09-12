import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import DefaultLayout from "../../layout/DefaultLayout";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { enqueueSnackbar } from "notistack";
import { FaUserCircle } from "react-icons/fa";
import Spinner from "../Spinner";
import ReasonDialog from "../ReasonDialog";

const MarkAttendance = () => {
  const [users, setUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedDate, setSelectedDate] = useState("");
  const [attendanceStatuses, setAttendanceStatuses] = useState({});
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogStudentId, setDialogStudentId] = useState(null);
  const [dialogReason, setDialogReason] = useState("");
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    updateDisplayedUsers(users, currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, users]);

  useEffect(() => {
    const defaultStatuses = displayedUsers.reduce(
      (acc, user) => ({
        ...acc,
        [user.id]: { status: "Present", reason: "" },
      }),
      {}
    );
    setAttendanceStatuses(defaultStatuses);
  }, [displayedUsers]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const usersList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      usersList.sort((a, b) => a.regNo.localeCompare(b.regNo));
      setUsers(usersList);
      setLoading(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching users: ", error);
      setLoading(false);
    }
  };

  const updateDisplayedUsers = (usersList, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    setDisplayedUsers(usersList.slice(startIndex, endIndex));
  };

  useEffect(() => {
    setIsSaveDisabled(!selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStatusChange = (userId, status) => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        status,
      },
    }));
    if (status === "Leave" || status === "Absent") {
      setDialogStudentId(userId);
      setOpenDialog(true);
    }
  };

  const handleDialogSave = (studentId, reason) => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    if (isSaveDisabled) {
      enqueueSnackbar("Please select a date before saving attendance.", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Starting Batch Write");

      const batch = writeBatch(db);

      for (const user of displayedUsers) {
        const docRef = doc(db, "attendance", user.id);
        const docSnap = await getDoc(docRef);
        const newAttendanceRecord = {
          studentId: user.id,
          date: selectedDate,
          status: attendanceStatuses[user.id].status,
          reason: attendanceStatuses[user.id].reason,
          classId: user.classId,
        };

        if (docSnap.exists()) {
          console.log("Document Exists");
          const existingData = docSnap.data();
          const attendanceIndex = existingData.attendance.findIndex(
            (record) => record.date === selectedDate
          );

          if (attendanceIndex > -1) {
            console.log("Updating Existing Attendance Record");
            existingData.attendance[attendanceIndex] = newAttendanceRecord;
          } else {
            console.log("Adding New Attendance Record");
            existingData.attendance.push(newAttendanceRecord);
          }

          batch.update(docRef, { attendance: existingData.attendance });
        } else {
          console.log("Document Does Not Exist");
          batch.set(docRef, { attendance: [newAttendanceRecord] });
        }
      }

      await batch.commit();
      setLoading(false);
      setSelectedDate("");
      enqueueSnackbar("Attendance saved successfully.", { variant: "success" });
    } catch (error) {
      console.error("Error saving attendance:", error);
      enqueueSnackbar("Error saving attendance.", { variant: "error" });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(users.length / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Students Attendance Table" />
      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <div className="flex-col md:flex md:flex-row md:justify-between">
                <div>
                <button
                  onClick={handleSaveAttendance}
                   className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Save Attendance
                </button>
                </div>
              <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Select Date
                </label>
                <input
                  type="date"
                  onChange={handleDateChange}
                  value={selectedDate}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            {loading ? (
              <div className="border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                  Loading...
                </h4>
              </div>
            ) : users.length === 0 ? (
              <div className="border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                  No Data Available
                </h4>
              </div>
            ) : (
              <>
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                        Reg No.
                      </th>
                      <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                        Full Name
                      </th>
                      <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                        Father Name
                      </th>
                      <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                        Class
                      </th>
                      <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers.map((user) => {
                      const userStatus = attendanceStatuses[user.id] || {
                        status: "Present",
                        reason: "",
                      };
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-stroke text-black dark:border-strokedark dark:text-white"
                        >
                          <td className="py-4 px-4">{user.regNo}</td>
                          <td className="py-4 px-4">{user.name}</td>
                          <td className="py-4 px-4">{user.fName}</td>
                          <td className="py-4 px-4">{user.studentClass}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-4">
                              {["Present", "Absent", "Leave"].map((status) => (
                                <label
                                  key={status}
                                  className="inline-flex items-center"
                                >
                                  <input
                                    type="radio"
                                    className={`box mr-2 flex-row h-5 w-5 items-center justify-center rounded-full border border-primary ${
                                      isChecked && "!border-4"
                                    }`}
                                    name={`attendance-${user.id}`}
                                    value={status}
                                    checked={userStatus.status === status}
                                    onChange={() =>
                                      handleStatusChange(user.id, status)
                                    }
                                  />
                                  <span className="ml-2">{status}</span>
                                </label>
                              ))}
                            </div>
                            {userStatus.reason && (
                              <div className="text-xs text-gray-500 mt-5">
                                Reason:{userStatus.reason}{" "}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex justify-between items-center my-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Previous
                  </button>
                  <span className="text-base text-center dark:text-white">
                    Page {currentPage} of{" "}
                    {Math.ceil(users.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(users.length / itemsPerPage)
                    }
                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ReasonDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleDialogSave}
        studentId={dialogStudentId}
        initialReason={dialogReason}
      />
    </DefaultLayout>
  );
};

export default MarkAttendance;

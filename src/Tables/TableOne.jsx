import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useSnackbar } from "notistack";
import { ImEye } from "react-icons/im";
import DelDialogue from "../components/DelDialogue";
import { BiRightArrow } from "react-icons/bi";
import { IoIosArrowDroprightCircle } from "react-icons/io";

const TableOne = () => {
  const [users, setUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delLoading, setDelLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [classInput, setClassInput] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "classes"));
      const classessList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setClasses(classessList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching classes: ", error);
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const q = collection(db, "students");
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setAllUsers(usersList);
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users: ", error);
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    try {
      const lowerCaseKeyword = keyword.trim().toLowerCase();
      const lowerCaseClassInput = classInput.trim().toLowerCase();

      const filteredUsers = allUsers.filter((user) => {
        const lowerCaseName = user.name.toLowerCase();
        const lowerCaseStudentClass = user.studentClass.toLowerCase();

        const nameMatches = lowerCaseKeyword
          ? lowerCaseName.includes(lowerCaseKeyword)
          : true;
        const classMatches = lowerCaseClassInput
          ? lowerCaseStudentClass.includes(lowerCaseClassInput)
          : true;

        return nameMatches && classMatches;
      });

      const sortedUsers = filteredUsers.sort((a, b) => {
        const regNoA = a.regNo.toLowerCase();
        const regNoB = b.regNo.toLowerCase();

        return sortDirection === "asc"
          ? regNoA.localeCompare(regNoB)
          : regNoB.localeCompare(regNoA);
      });

      setUsers(sortedUsers);
      setLoading(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error filtering and sorting users: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [keyword, classInput, sortDirection]);

  const handleInputChange = (e) => {
    setKeyword(e.target.value);
  };

  const fetchUsersByClass = async () => {
    try {
      const studentsRef = collection(db, "students");
      let q = query(studentsRef);

      if (selectedClass.trim()) {
        q = query(q, where("studentClass", "==", selectedClass.trim()));
      }

      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setUsers(usersList);
      setLoading(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching users: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchUsersByClass();
  }, [selectedClass]);

  useEffect(() => {
    let filteredUsers = users;

    if (searchQuery.trim()) {
      filteredUsers = users.filter((user) => {
        const fullName = `${user.firstName || ""} ${
          user.surname || ""
        }`.toLowerCase();
        return fullName.includes(searchQuery.trim().toLowerCase());
      });
    }

    filteredUsers = filteredUsers.sort((a, b) =>
      a.regNo.localeCompare(b.regNo)
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [searchQuery, users, currentPage, itemsPerPage]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(users.length / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setDelLoading(false);
    setShowDeleteDialog(true);
  };

  const deleteUserHandler = async () => {
    try {
      setDelLoading(true);

      const batch = writeBatch(db);

      const studentsQuery = query(collection(db, "students"));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentIds = studentsSnapshot.docs.map((doc) => doc.id);
      t;
      for (const studentId of studentIds) {
        const attendanceRef = doc(db, "attendance", studentId);
        const docSnap = await getDoc(attendanceRef);

        if (docSnap.exists()) {
          const attendanceData = docSnap.data().attendance || [];
          const hasClassStudentId = attendanceData.some(
            (record) => record.studentId === userToDelete
          );

          if (hasClassStudentId) {
            batch.delete(attendanceRef);
          }
        }
      }

      const examsQuery = query(
        collection(db, "exams"),
        where("studentId", "==", userToDelete)
      );
      const examsSnapshot = await getDocs(examsQuery);
      if (examsSnapshot.empty) {
        console.log("No exam records found for this student");
      } else {
        examsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        console.log(
          "Exams records to delete:",
          examsSnapshot.docs.map((doc) => doc.id)
        );
      }

      batch.delete(doc(db, "students", userToDelete));

      await batch.commit();
      console.log("Batch commit successful");

      enqueueSnackbar("Student and all associated data deleted successfully", {
        variant: "success",
      });
      setUsers(users.filter((user) => user.id !== userToDelete));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting user and associated data: ", error);
      enqueueSnackbar("Failed to delete student and associated data", {
        variant: "error",
      });
    } finally {
      setDelLoading(false);
    }
  };


  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <div className="flex-col md:flex md:flex-row md:justify-between">
          <div className="flex flex-col justify-between md:flex-row">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              All Students
            </h4>
          </div>
          <div className="flex-col md:flex md:flex-row gap-20">
            <div className="mb-4 w-50">
              <label className="mb-2 block text-black dark:text-white">
                Search by Name
              </label>
              <input
                type="text"
                value={keyword}
                onChange={handleInputChange}
                placeholder="Enter name"
                className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>
            <div className="mb-4 w-50">
              <label className="mb-2 block text-black dark:text-white">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">All</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.className}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
            <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
              Loading...
            </h4>
          </div>
        ) : displayedUsers.length === 0 ? (
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
                    Name
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Father Name
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Class
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="border-b border-[#eee]  dark:border-strokedark py-4 px-4">
                      {user.regNo}
                    </td>
                    <td className="border-b border-[#eee]  dark:border-strokedark py-4 px-4">
                      {user.name}
                    </td>
                    <td className="border-b border-[#eee]  dark:border-strokedark py-4 px-4">
                      {user.fName}
                    </td>
                    <td className="border-b border-[#eee]  dark:border-strokedark py-4 px-4">
                      {user.studentClass}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        <button className="hover:text-primary p-2">
                          <Link to={`/view/${user.id}`}>
                            <IoIosArrowDroprightCircle />
                          </Link>
                        </button>
                        {/* <button className="hover:text-primary">
                          <MdDeleteForever
                            onClick={() => confirmDeleteUser(user.id)}
                          />
                        </button>
                        <Link to={`/update-user/${user.id}`}>
                          <button className="hover:text-primary">
                            <MdEdit />
                          </button>
                        </Link> */}
                      </div>
                    </td>
                  </tr>
                ))}
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
                Page {currentPage} of {Math.ceil(users.length / itemsPerPage)}
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
      {showDeleteDialog && (
        <DelDialogue
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={deleteUserHandler}
          loading={delLoading}
        />
      )}
    </div>
  );
};

export default TableOne;

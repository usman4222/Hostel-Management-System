import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import DefaultLayout from "../../layout/DefaultLayout";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { useSnackbar } from "notistack";
import DelDialogue from "../DelDialogue";

const AllExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [nameKeyword, setNameKeyword] = useState("");
  const [subjectKeyword, setSubjectKeyword] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [filteredExams, setFilteredExams] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [delLoading, setDelLoading] = useState(false);

  const fetchStudentById = async (studentId) => {
    if (!studentId) {
      console.error("Student ID is not provided");
      return "Unknown Reg No";
    }

    try {
      const studentDoc = await getDoc(doc(db, "students", studentId));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        if (studentData && studentData.regNo) {
          return studentData.regNo;
        } else {
          console.error("Student document exists but does not contain regNo");
          return "Unknown Reg No";
        }
      } else {
        console.error("No such student!");
        return "Unknown Reg No";
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      return "Unknown Reg No";
    }
  };

  const fetchExams = async () => {
    try {
      const examsSnapshot = await getDocs(collection(db, "exams"));
      const examsList = [];

      for (const examDoc of examsSnapshot.docs) {
        const examData = examDoc.data();
        console.log("Fetching regNo for studentId:", examData.studentId);
        const regNo = await fetchStudentById(examData.studentId);

        examsList.push({
          ...examData,
          id: examDoc.id,
          className: examData.className || "Unknown Class",
          regNo,
        });

        console.log("Fetched regNo:", regNo);
      }

      examsList.sort((a, b) => a.className.localeCompare(b.className));

      setExams(examsList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setLoading(false);
    }
  };

  const filterExams = () => {
    const filtered = exams.filter((exam) => {
      const matchesClass = selectedClass
        ? exam.className.toLowerCase().includes(selectedClass.toLowerCase())
        : true;
      const matchesName = nameKeyword
        ? exam.studentName.toLowerCase().includes(nameKeyword.toLowerCase())
        : true;
      const matchesSubject = subjectKeyword
        ? exam.subject.toLowerCase().includes(subjectKeyword.toLowerCase())
        : true;
      const matchesTerm = selectedTerm
        ? exam.examTerm.toLowerCase() === selectedTerm.toLowerCase()
        : true;

      return matchesClass && matchesName && matchesSubject && matchesTerm;
    });

    filtered.sort((a, b) => a.className.localeCompare(b.className));

    setFilteredExams(filtered);
  };

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, selectedClass, nameKeyword, subjectKeyword, selectedTerm]);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "classes"));
      const classesList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setClasses(classesList);
    } catch (error) {
      console.error("Error fetching classes: ", error);
    }
  };

  const handleNameInputChange = (e) => {
    setNameKeyword(e.target.value);
  };

  const handleSubjectInputChange = (e) => {
    setSubjectKeyword(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleTermChange = (e) => {
    setSelectedTerm(e.target.value);
  };

  const confirmDeleteUser = (examId) => {
    setExamToDelete(examId);
    setShowDeleteDialog(true);
    setDelLoading(false);
  };

  const deleteExamHandler = async () => {
    try {
      setDelLoading(true);
      await deleteDoc(doc(db, "exams", examToDelete));
      enqueueSnackbar("Exam deleted successfully", { variant: "success" });
      fetchExams();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting exam: ", error);
    } finally {
      setDelLoading(false);
    }
  };

  const formatTerm = (term) => {
    switch (term) {
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "midterm":
        return "Mid Term";
      case "finalterm":
        return "Final Term";
      default:
        return term;
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Exams Table" />
      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <div className="flex flex-col justify-between md:flex-row">
              <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                All Exams
              </h4>
              <div className="flex-col md:flex md:flex-row gap-20">
                <div className="mb-4 w-50">
                  <label className="mb-2 block text-black dark:text-white">
                    Filter by Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={handleClassChange}
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.className}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4 w-50">
                  <label className="mb-2 block text-black dark:text-white">
                    Search by Student Name
                  </label>
                  <input
                    type="text"
                    value={nameKeyword}
                    onChange={handleNameInputChange}
                    placeholder="Enter student name"
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                <div className="mb-4 w-50">
                  <label className="mb-2 block text-black dark:text-white">
                    Search by Subject Name
                  </label>
                  <input
                    type="text"
                    value={subjectKeyword}
                    onChange={handleSubjectInputChange}
                    placeholder="Enter subject name"
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                <div className="mb-4 w-50">
                  <label className="mb-2 block text-black dark:text-white">
                    Filter by Exam Term
                  </label>
                  <select
                    value={selectedTerm}
                    onChange={handleTermChange}
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    <option value="">All Terms</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="midterm">Mid Term</option>
                    <option value="finalterm">Final Term</option>
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
            ) : filteredExams.length === 0 ? (
              <div className="border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                  No exams available
                </h4>
              </div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Reg No
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Student Name
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Class Name
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Subject Name
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Exam Term
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Year
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Total Marks
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Obtained Marks
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Percentage
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map((exam, index) => (
                    <tr key={index}>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {exam.regNo}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {exam.studentName}
                      </td> 
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {exam.className}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {exam.subject}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {formatTerm(exam.examTerm)}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {exam.selectedYear}
                      </td>

                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {exam.totalMarks}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {exam.obtainedMarks}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        {((exam.obtainedMarks / exam.totalMarks) * 100).toFixed(
                          2
                        )}
                        %
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <Link to={`/edit-exam/${exam.id}`}>
                            <MdEdit className="hover:text-primary" />
                          </Link>
                          <button className="hover:text-primary">
                            <MdDeleteForever
                              onClick={() => confirmDeleteUser(exam.id)}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {showDeleteDialog && (
          <DelDialogue
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={deleteExamHandler}
            loading={delLoading}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default AllExams;

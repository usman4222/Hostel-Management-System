import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';

const AttendanceDetails = () => {
    const [users, setUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [attendanceStatuses, setAttendanceStatuses] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [classInput, setClassInput] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [reasons, setReasons] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        updateDisplayedUsers(users, currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, users]);

    useEffect(() => {
        fetchAttendanceStatuses();
    }, [displayedUsers]);

    const handleInputChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
    };

    const fetchUsers = async () => {
        try {
            const q = collection(db, 'students');
            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users: ", error);
            setLoading(false);
        }
    };

    const fetchUsersByName = async () => {
        try {
            let q = collection(db, 'students');

            if (keyword.trim() || classInput.trim()) {
                let filters = [];
                if (keyword.trim()) {
                    filters.push(where('name', '>=', keyword.trim()));
                    filters.push(where('name', '<=', keyword.trim() + '\uf8ff'));
                }
                if (classInput.trim()) {
                    filters.push(where('studentClass', '==', classInput.trim()));
                }

                if (filters.length > 0) {
                    q = query(q, ...filters);
                }
            }

            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersList);
            setLoading(false);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching users: ", error);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsersByName();
    }, [keyword, classInput]);

    const fetchUsersByClass = async () => {
        try {
            const studentsRef = collection(db, 'students');
            let q = query(studentsRef);

            if (selectedClass.trim()) {
                q = query(q, where('studentClass', '==', selectedClass.trim()));
            }

            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersList);
            setLoading(false);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching users: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersByClass();
    }, [selectedClass]);

    const updateDisplayedUsers = (usersList, page, perPage) => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        setDisplayedUsers(usersList.slice(startIndex, endIndex));
    };

    const fetchClasses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'classes'));
            const classessList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setClasses(classessList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching classes: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchAttendanceStatuses = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const statuses = {};
            const reasonsMap = {};

            for (const user of displayedUsers) {
                const docRef = doc(db, 'attendance', user.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const attendanceRecords = docSnap.data().attendance || [];
                    const todayRecord = attendanceRecords.find(record => record.date === today);
                    statuses[user.id] = todayRecord ? todayRecord.status : 'Not Marked';
                    reasonsMap[user.id] = todayRecord ? todayRecord.reason || '' : '';
                } else {
                    statuses[user.id] = 'Not Marked';
                    reasonsMap[user.id] = '';
                }
            }

            setAttendanceStatuses(statuses);
            setReasons(reasonsMap);
        } catch (error) {
            console.error('Error fetching attendance statuses:', error);
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
            <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    <div className='flex flex-col justify-between md:flex-row'>
                        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                            All Students
                        </h4>
                    </div>
                    <div className='flex-col md:flex md:flex-row gap-20'>
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
                                <option value="">Select a class</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.className}>{cls.className}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {loading ? (
                        <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                            <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                Loading...
                            </h4>
                        </div>
                    ) : users.length === 0 ? (
                        <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                            <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                No Data Available
                            </h4>
                        </div>
                    ) : (
                        <>
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Reg No.</th>
                                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Name</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Class</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Today Status</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Reason</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{user.regNo}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                                <p className="text-black dark:text-white">{user.name}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{user.studentClass}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{attendanceStatuses[user.id] || 'Not Marked'}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{reasons[user.id] || 'No Reason'}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <Link
                                                    to={`/attendance/view/${user.id}`}
                                                    className="inline-flex items-center justify-center bg-black py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                                                >
                                                    Attendance Details
                                                </Link>
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
                                    disabled={currentPage === Math.ceil(users.length / itemsPerPage)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AttendanceDetails;

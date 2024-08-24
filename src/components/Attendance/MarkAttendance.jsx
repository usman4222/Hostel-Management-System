import React, { useEffect, useState } from 'react';
import { collection, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { enqueueSnackbar } from 'notistack';
import { FaUserCircle } from 'react-icons/fa';
import Spinner from '../Spinner';

const MarkAttendance = () => {
    const [users, setUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedDate, setSelectedDate] = useState('');
    const [attendanceStatuses, setAttendanceStatuses] = useState({});
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [isChecked, setIsChecked] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        updateDisplayedUsers(users, currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, users]);

    useEffect(() => {
        const defaultStatuses = displayedUsers.reduce((acc, user) => ({
            ...acc,
            [user.id]: 'Present'
        }), {});
        setAttendanceStatuses(defaultStatuses);
    }, [displayedUsers]);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'students'));
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
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

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        setIsSaveDisabled(date === '');
    };

    const handleStatusChange = (userId, status) => {
        console.log(`Changing status for user ${userId} to ${status}`);
        setAttendanceStatuses(prev => ({ ...prev, [userId]: status }));
    };


    // const handleStatusChange = (userId, status) => {
    //     setAttendanceStatuses(prev => ({ ...prev, [userId]: status }));
    // };

    const handleSaveAttendance = async () => {
        if (!selectedDate) {
            enqueueSnackbar('Please select a date before saving attendance.', { variant: 'warning' });
            return;
        }

        try {
            setLoading(true);

            const batch = writeBatch(db);

            for (const user of displayedUsers) {
                const docRef = doc(db, 'attendance', user.id);
                const docSnap = await getDoc(docRef);
                const newAttendanceRecord = {
                    userId: user.id,
                    date: selectedDate,
                    status: attendanceStatuses[user.id]
                };

                if (docSnap.exists()) {
                    const existingData = docSnap.data();
                    const attendanceIndex = existingData.attendance.findIndex(record => record.date === selectedDate);

                    if (attendanceIndex > -1) {
                        existingData.attendance[attendanceIndex] = newAttendanceRecord;
                    } else {
                        existingData.attendance.push(newAttendanceRecord);
                    }

                    batch.update(docRef, { attendance: existingData.attendance });
                } else {
                    batch.set(docRef, { attendance: [newAttendanceRecord] });
                }
            }

            await batch.commit();
            setLoading(false);
            enqueueSnackbar('Attendance saved successfully.', { variant: 'success' });
        } catch (error) {
            setLoading(false);
            console.error('Error saving attendance:', error);
            enqueueSnackbar('Error saving attendance.', { variant: 'error' });
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
                        <div className='flex flex-col justify-between md:flex-row'>
                            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                                Select Date
                            </h4>
                            <div className="mb-10 mt-5 md:mt-0 md:mb-0">
                                <div className="relative">
                                    <input
                                        type="date"
                                        onChange={handleDateChange}
                                        value={selectedDate}
                                        className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white md:w-50 "
                                    />
                                </div>
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
                                            <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Profile Img</th>
                                            <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Reg No.</th>
                                            <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Name</th>
                                            <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Father Name</th>
                                            <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Class</th>
                                            <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-stroke text-black dark:border-strokedark dark:text-white">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                                            {user.profileImage ? (
                                                                <img
                                                                    src={user.profileImage}
                                                                    alt="User Profile"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaUserCircle className="h-full w-full text-gray-300" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">{user.regNo}</td>
                                                <td className="py-4 px-4">{user.name}</td>
                                                <td className="py-4 px-4">{user.fName}</td>
                                                <td className="py-4 px-4">{user.studyProgress}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex gap-6">
                                                        <label>
                                                            <div className='flex justify-center items-center'>
                                                                <input
                                                                    type="radio"
                                                                    name={`status-${user.id}`}
                                                                    value="Present"
                                                                    checked={attendanceStatuses[user.id] === 'Present'}
                                                                    onChange={() => handleStatusChange(user.id, 'Present')}
                                                                    className={`box mr-2 flex-row h-5 w-5 items-center justify-center rounded-full border border-primary ${isChecked && '!border-4'
                                                                        }`}
                                                                />
                                                                Present
                                                            </div>
                                                        </label>
                                                        <label>
                                                            <div className='flex justify-center items-center'>
                                                                <input
                                                                    type="radio"
                                                                    name={`status-${user.id}`}
                                                                    value="Absent"
                                                                    checked={attendanceStatuses[user.id] === 'Absent'}
                                                                    onChange={() => handleStatusChange(user.id, 'Absent')}
                                                                    className={`box mr-2 flex-row h-5 w-5 items-center justify-center rounded-full border border-primary ${isChecked && '!border-4'
                                                                        }`}
                                                                />
                                                                Absent
                                                            </div>
                                                        </label>
                                                        <label>
                                                            <div className='flex justify-center items-center'>
                                                                <input
                                                                    type="radio"
                                                                    name={`status-${user.id}`}
                                                                    value="Leave"
                                                                    checked={attendanceStatuses[user.id] === 'Leave'}
                                                                    onChange={() => handleStatusChange(user.id, 'Leave')}
                                                                    className={`box mr-2 flex-row h-5 w-5 items-center justify-center rounded-full border border-primary ${isChecked && '!border-4'
                                                                        }`}
                                                                />
                                                                Leave
                                                            </div>
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className='flex justify-center items-center py-5'>
                                    <button
                                        onClick={handleSaveAttendance}
                                        disabled={isSaveDisabled}
                                        className={`py-2 px-4 rounded mt-4 text-white ${isSaveDisabled ? 'bg-blue-700 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
                                            }`}
                                    >
                                        {loading ? <Spinner /> : 'Save Attendance'}
                                    </button>
                                </div>
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
            </div>
        </DefaultLayout>
    );
};


export default MarkAttendance;

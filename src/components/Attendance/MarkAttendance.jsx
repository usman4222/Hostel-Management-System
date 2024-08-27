import React, { useState, useEffect } from 'react';
import { collection, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { enqueueSnackbar } from 'notistack';
import { FaUserCircle } from 'react-icons/fa';
import Spinner from '../Spinner';
import ReasonDialog from '../ReasonDialog';

const MarkAttendance = () => {
    const [users, setUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedDate, setSelectedDate] = useState('');
    const [attendanceStatuses, setAttendanceStatuses] = useState({});
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogStudentId, setDialogStudentId] = useState(null);
    const [dialogReason, setDialogReason] = useState('');
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
            [user.id]: { status: 'Present', reason: '' }
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
        setAttendanceStatuses(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                status
            }
        }));
        if (status === 'Leave' || status === 'Absent') {
            setDialogStudentId(userId);
            setOpenDialog(true);
        }
    };

    const handleDialogSave = (studentId, reason) => {
        setAttendanceStatuses(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                reason
            }
        }));
    };

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
                    status: attendanceStatuses[user.id].status,
                    reason: attendanceStatuses[user.id].reason
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
                                        className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white md:w-50"
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
                                            <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedUsers.map((user) => {
                                            const userStatus = attendanceStatuses[user.id] || { status: 'Present', reason: '' };
                                            return (
                                                <tr key={user.id} className="border-b border-stroke text-black dark:border-strokedark dark:text-white">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                                                {user.profileImage ? (
                                                                    <img className="h-full w-full object-cover" src={user.profileImage} alt="User Profile" />
                                                                ) : (
                                                                    <FaUserCircle className="h-full w-full text-gray-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">{user.regNo}</td>
                                                    <td className="py-4 px-4">{user.name}</td>
                                                    <td className="py-4 px-4">{user.fName}</td>
                                                    <td className="py-4 px-4">{user.studentClass}</td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center space-x-4">
                                                            {['Present', 'Absent', 'Leave'].map((status) => (
                                                                <label key={status} className="inline-flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        className={`box mr-2 flex-row h-5 w-5 items-center justify-center rounded-full border border-primary ${isChecked && '!border-4'
                                                                            }`}
                                                                        name={`attendance-${user.id}`}
                                                                        value={status}
                                                                        checked={userStatus.status === status}
                                                                        onChange={() => handleStatusChange(user.id, status)}
                                                                    />
                                                                    <span className="ml-2">{status}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        {userStatus.reason && (
                                                            <div className="text-xs text-gray-500 mt-5">Reason:{userStatus.reason} </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className='flex justify-center pt-10'>
                                    <button
                                        onClick={handleSaveAttendance}
                                        disabled={isSaveDisabled}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                                    >
                                        Save Attendance
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

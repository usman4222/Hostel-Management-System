import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import { db } from '../../firebase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import StudentSearchAttendanceGraph from '../../Charts/StudentSearchAttendanceGraph';
import EditAttendanceDialog from './EditAttendanceDialog';
import { MdEdit } from 'react-icons/md';
import { IconButton } from '@mui/material';


const AttendanceSearchTable = () => {
    const { userId } = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const [userName, setUserName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [userAttendance, setUserAttendance] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null); 
    const [openDialog, setOpenDialog] = useState(false); 

    const fetchUserData = async (userId) => {
        try {
            const userDocRef = doc(db, 'students', userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();

                setUserName(userData.name || 'No Name');
            } else {
                setUserName('No Name');
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData(userId);
        }
    }, [userId]);

    const handleSearch = async () => {
        if (!startDate || !endDate) {
            enqueueSnackbar('Please select both start and end dates', { variant: 'warning' });
            return;
        }

        setLoading(true);

        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const attendanceRef = collection(db, 'attendance');
            const userDocRef = doc(attendanceRef, userId);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const attendanceArray = docSnap.data().attendance || [];

                const filteredData = attendanceArray.filter(record =>
                    new Date(record.date) >= start &&
                    new Date(record.date) <= end &&
                    record.userId === userId
                );

                setUserAttendance(filteredData);
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            enqueueSnackbar('Failed to fetch attendance data', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const processAttendanceData = (attendance) => {
        const counts = { presentCount: 0, absentCount: 0, leaveCount: 0 };
        attendance.forEach(record => {
            if (record.status === 'Present') counts.presentCount++;
            if (record.status === 'Absent') counts.absentCount++;
            if (record.status === 'Leave') counts.leaveCount++;
        });
        const totalEntries = attendance.length;
        const presentPercentage = totalEntries ? (counts.presentCount / totalEntries * 100).toFixed(2) : 0;
        return { ...counts, totalEntries, presentPercentage };
    };

    const attendanceData = processAttendanceData(userAttendance);



    
    
    const normalizeDate = (date) => {
        return new Date(date).toISOString().split('T')[0]; // Format: YYYY-MM-DD
    };
    

    const handleUpdate = async (updatedRecord) => {
        console.log('Updated Record:', updatedRecord);
        console.log('Current Attendance:', userAttendance);
    
        const normalizeDate = (date) => new Date(date).toISOString().split('T')[0];
        const normalizedUpdatedDate = normalizeDate(updatedRecord.date);
    
        console.log('Normalized Updated Date:', normalizedUpdatedDate);
    
        const updatedRecordId = `${updatedRecord.userId}_${normalizedUpdatedDate}`;
    
        // Print out the `userAttendance` to debug
        userAttendance.forEach(record => {
            const normalizedRecordDate = normalizeDate(record.date);
            const recordId = `${record.userId}_${normalizedRecordDate}`;
            console.log(`Existing Record ID: ${recordId}`);
        });
    
        const recordIndex = userAttendance.findIndex(record => {
            const normalizedRecordDate = normalizeDate(record.date);
            const recordId = `${record.userId}_${normalizedRecordDate}`;
            console.log(`Comparing Existing Record ID: ${recordId} with Updated Record ID: ${updatedRecordId}`);
            return recordId === updatedRecordId;
        });
    
        console.log('Record Index:', recordIndex);
    
        let updatedAttendance;
    
        if (recordIndex !== -1) {
            updatedAttendance = [
                ...userAttendance.slice(0, recordIndex),
                { ...updatedRecord, date: normalizedUpdatedDate },
                ...userAttendance.slice(recordIndex + 1)
            ];
            console.log('Record updated at index:', recordIndex);
        } else {
            updatedAttendance = [...userAttendance, { ...updatedRecord, date: normalizedUpdatedDate }];
            console.log('New record added');
        }
    
        console.log('Updated Attendance Array:', updatedAttendance);
        setUserAttendance(updatedAttendance);
    
        try {
            const attendanceRef = doc(db, 'attendance', userId);
            await updateDoc(attendanceRef, { attendance: updatedAttendance });
            enqueueSnackbar('Attendance record updated successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error updating attendance record:', error);
            enqueueSnackbar('Failed to update attendance record', { variant: 'error' });
        }
    
        setOpenDialog(false);
    };
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setOpenDialog(true); 
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Employees Attendance Table" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        Search Attendance
                    </h4>
                    <div className="max-w-full overflow-x-auto lg:overflow-x-hidden">
                        <div className="flex justify-center items-center pb-10">
                            <div className="flex flex-col">
                                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                                    <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                        <h3 className="font-medium text-black dark:text-white">
                                            From-To
                                        </h3>
                                    </div>

                                    <div className="flex flex-col gap-5.5 p-6.5">
                                        <div className='flex gap-5 md:flex-row flex-col'>
                                            <div className="relative">
                                                <input
                                                    type='date'
                                                    placeholder="Start Date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="relative z-20 w-full appearance-none rounded border hover:cursor-pointer border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type='date'
                                                    placeholder="End Date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="relative z-20 w-full appearance-none rounded border hover:cursor-pointer border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={handleSearch}
                                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                            disabled={loading}
                                        >
                                            {loading ? 'Loading...' : 'Search'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white pt-5">
                            {userName}'s Attendance Details
                        </h4>
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        ) : userAttendance.length > 0 ? (

                            <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                                <table className="w-full table-auto mb-10">
                                    <thead>
                                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                            <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Date</th>
                                            <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
                                            <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Resaon</th>
                                            <th className="min-w-[50px] py-4 px-4 font-medium text-black dark:text-white">Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userAttendance.length > 0 ? (
                                            userAttendance.map((detail, index) => (
                                                <tr key={index}>
                                                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                                        <p className="text-black dark:text-white">{detail.date}</p>
                                                    </td>
                                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                        <p className="text-black dark:text-white">{detail.status}</p>
                                                    </td>
                                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                        <p className="text-black dark:text-white">{detail.reason || 'No Reason'}</p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <IconButton onClick={() => handleEditClick(detail)}>
                                                            <MdEdit className='dark:text-white' />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="py-5 px-4 text-center text-black dark:text-white">
                                                    No attendance data available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="max-w-full overflow-x-auto lg:overflow-x-hidden">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Present</th>
                                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Absent</th>
                                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Leave</th>
                                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Total Days</th>
                                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Present Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                                    <p className="text-black dark:text-white">{attendanceData.presentCount}</p>
                                                </td>
                                                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">{attendanceData.absentCount}</p>
                                                </td>
                                                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">{attendanceData.leaveCount}</p>
                                                </td>
                                                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">{attendanceData.totalEntries}</p>
                                                </td>
                                                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">{attendanceData.presentPercentage}%</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="pt-10">
                                        <StudentSearchAttendanceGraph userAttendance={attendanceData} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex w-full border-l-6 mb-10 border-warning bg-warning bg-opacity-[15%] px-7 py-8 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9">
                                <div className="mr-5 flex h-9 w-9 items-center justify-center rounded-lg bg-warning bg-opacity-30">
                                    <svg
                                        width="19"
                                        height="16"
                                        viewBox="0 0 19 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M1.50493 16H17.5023C17.9676 16 18.4085 15.8192 18.7618 15.4798C19.1056 15.1406 19.2832 14.5731 19.2832 14.0004V2.00037C19.2832 1.4276 19.1056 0.860076 18.7618 0.520781C18.4085 0.181486 17.9676 0.000732 17.5023 0.000732H1.50493C1.03964 0.000732 0.598728 0.181486 0.245395 0.520781C-0.108849 0.860076 -0.286497 1.4276 -0.286497 2.00037V14.0004C-0.286497 14.5731 -0.108849 15.1406 0.245395 15.4798C0.598728 15.8192 1.03964 16 1.50493 16ZM1.50493 4.01062C1.88515 4.01062 2.20863 4.33411 2.20863 4.72524V10.0525C2.20863 10.4436 1.88515 10.7671 1.50493 10.7671H0.00248764C-0.378736 10.7671 -0.702211 10.4436 -0.702211 10.0525V4.72524C-0.702211 4.33411 -0.378736 4.01062 0.00248764 4.01062H1.50493ZM8.75236 4.01062C9.13258 4.01062 9.45605 4.33411 9.45605 4.72524V10.0525C9.45605 10.4436 9.13258 10.7671 8.75236 10.7671H7.24989C6.86967 10.7671 6.54619 10.4436 6.54619 10.0525V4.72524C6.54619 4.33411 6.86967 4.01062 7.24989 4.01062H8.75236Z"
                                            fill="#F56C6C"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-black dark:text-white">
                                        No Data Found
                                    </p>
                                    <p className="text-base text-body dark:text-white/70">
                                        No attendance records found for the selected date range.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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

export default AttendanceSearchTable;
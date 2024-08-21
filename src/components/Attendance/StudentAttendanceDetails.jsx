import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to extract user ID from the URL
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';

const StudentAttendanceDetails = () => {
    const { userId } = useParams(); 
    console.log(userId);
    
    const [userAttendance, setUserAttendance] = useState({
        presentCount: 0,
        absentCount: 0,
        leaveCount: 0,
        totalEntries: 0,
        presentPercentage: 0,
    });

    useEffect(() => {
        if (userId) {
            fetchUserAttendance(userId);
        }
    }, [userId]);

    const fetchUserAttendance = async (userId) => {
        try {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const userDocRef = doc(db, 'attendance', userId);
            const q = query(
                collection(userDocRef, 'attendanceRecords'),
                where('date', '>=', firstDayOfMonth)
            );

            const querySnapshot = await getDocs(q);
            const attendanceData = querySnapshot.docs.map(doc => doc.data());

            console.log('Fetched Attendance Data:', attendanceData); 

            let presentCount = 0;
            let absentCount = 0;
            let leaveCount = 0;

            attendanceData.forEach(record => {
                if (record.status === 'Present') presentCount++;
                if (record.status === 'Absent') absentCount++;
                if (record.status === 'Leave') leaveCount++;
            });

            const totalEntries = presentCount + absentCount + leaveCount;
            const presentPercentage = totalEntries > 0 ? ((presentCount / totalEntries) * 100).toFixed(2) : 0;

            console.log('Attendance Counts:', {
                presentCount,
                absentCount,
                leaveCount,
                totalEntries,
                presentPercentage
            }); 

            setUserAttendance({
                presentCount,
                absentCount,
                leaveCount,
                totalEntries,
                presentPercentage,
            });
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Student Attendance Details" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        Attendance Details
                    </h4>
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
                                        <p className="text-black dark:text-white">{userAttendance.presentCount}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-black dark:text-white">{userAttendance.absentCount}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-black dark:text-white">{userAttendance.leaveCount}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-black dark:text-white">{userAttendance.totalEntries}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-black dark:text-white">{userAttendance.presentPercentage}%</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {/* You can add an AttendanceGraph component here if needed */}
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default StudentAttendanceDetails;

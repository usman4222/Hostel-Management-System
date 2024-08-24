import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import AttendanceGraph from '../../Charts/AttendnaceGraph';


const StudentAttendanceDetails = () => {
    const { userId } = useParams();
    const [userName, setUserName] = useState('');

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

    const fetchUserAttendance = async (userId) => {
        try {
            const docRef = doc(db, 'attendance', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const attendanceData = docSnap.data().attendance || [];

                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                let presentCount = 0;
                let absentCount = 0;
                let leaveCount = 0;

                attendanceData.forEach(record => {
                    const recordDate = new Date(record.date);
                    const recordMonth = recordDate.getMonth();
                    const recordYear = recordDate.getFullYear();

                    if (recordMonth === currentMonth && recordYear === currentYear) {
                        if (record.status === 'Present') presentCount++;
                        if (record.status === 'Absent') absentCount++;
                        if (record.status === 'Leave') leaveCount++;
                    }
                });

                const totalEntries = presentCount + absentCount + leaveCount;
                const presentPercentage = totalEntries > 0 ? ((presentCount / totalEntries) * 100).toFixed(2) : 0;

                setUserAttendance({
                    presentCount,
                    absentCount,
                    leaveCount,
                    totalEntries,
                    presentPercentage,
                });
            } else {
                console.log("No such document!");
                setUserAttendance({
                    presentCount: 0,
                    absentCount: 0,
                    leaveCount: 0,
                    totalEntries: 0,
                    presentPercentage: 0,
                });
            }
        } catch (error) {
            console.error("Error fetching attendance details: ", error);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Student Attendance Details" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        {userName}'s Attendance Details
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
                        <AttendanceGraph userAttendance={userAttendance} />
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default StudentAttendanceDetails;

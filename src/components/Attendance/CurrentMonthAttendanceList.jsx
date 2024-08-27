import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { FaSearch } from "react-icons/fa";
import { db } from '../../firebase';
import { getDoc, doc } from 'firebase/firestore';

const CurrentMonthAttendanceList = () => {
    const [attendanceArray, setAttendanceArray] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const { userId } = useParams();

    useEffect(() => {
        if (userId) {
            fetchUserData(userId);
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

    const fetchUserAttendance = async (userId) => {
        setLoading(true);
        try {
            const docRef = doc(db, 'attendance', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const attendanceData = docSnap.data().attendance || [];
                const currentMonthAttendance = filterCurrentMonth(attendanceData);
                setAttendanceArray(currentMonthAttendance);
            } else {
                console.log("No such document!");
                setAttendanceArray([]);
            }
        } catch (error) {
            console.error("Error fetching attendance details: ", error);
        } finally {
            setLoading(false)
        }
    };

    const filterCurrentMonth = (attendanceData) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return attendanceData.filter(record => {
            const recordDate = new Date(record.date);
            const recordMonth = recordDate.getMonth();
            const recordYear = recordDate.getFullYear();

            return recordMonth === currentMonth && recordYear === currentYear;
        });
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Employees Attendance Table" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className='flex md:justify-between md:flex-row flex-col'>
                        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        {userName}'s Current Month Attendance List
                        </h4>
                        <h4 className="md:text-xl text-lg mb-5 md:mb-0 flex justify-start md:pb-5 font-semibold text-black dark:text-white">
                            <Link
                                to={`/searchattendance/${userId}`}
                                className="inline-flex items-center justify-center gap-3 md:px-10 text-center font-medium text-white hover:underline lg:px-8 xl:px-10"
                            >
                                <FaSearch /> Search Attendance
                            </Link>
                        </h4>
                    </div>
                    <div className="max-w-full overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-10">
                                <p className="text-black dark:text-white">Loading...</p>
                            </div>
                        ) : (
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Date</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Resaon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceArray.length > 0 ? (
                                        attendanceArray.map((detail, index) => (
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
                        )}
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default CurrentMonthAttendanceList;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { ImEye } from "react-icons/im";
import { collection, getDocs, deleteDoc, doc, query, where, writeBatch, getDoc, updateDoc, increment } from 'firebase/firestore';

import '@firebase/firestore';
import { useSnackbar } from 'notistack';
import { CSVLink } from 'react-csv';
import { FaUserCircle } from 'react-icons/fa';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';

const AttendanceDetails = () => {
    const [users, setUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const { enqueueSnackbar } = useSnackbar();
    const [keyword, setKeyword] = useState("");


    const fetchUsers = async (searchKeyword = "") => {
        try {
            let q;
            if (searchKeyword.trim()) {
                q = query(
                    collection(db, 'students'),
                    where('email', '==', searchKeyword.trim())
                );
            } else {
                q = collection(db, 'students');
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



    const handleInputChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        fetchUsers(value);
    };

    const updateDisplayedUsers = (usersList, page, perPage) => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        setDisplayedUsers(usersList.slice(startIndex, endIndex));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        updateDisplayedUsers(users, currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, users]);


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
                    <div className="mb-10 mt-5 md:mt-0 md:mb-0">
                        <div className="relative">
                            <button type="submit" className="absolute left-0 top-1/2 -translate-y-1/2">
                                <button className="absolute left-0 top-1/2 -translate-y-1/2">
                                    <svg
                                        className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                                            fill=""
                                        />
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                                            fill=""
                                        />
                                    </svg>
                                </button>
                            </button>

                            <input
                                type="text"
                                placeholder='Search by Email...'
                                onChange={handleInputChange}
                                value={keyword}
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
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">B Form No.</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Reg No.</th>
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Name</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Class</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt="User" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <FaUserCircle size={32} color="white" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.bFormNo}</p>
                                        </td>
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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { ImEye } from "react-icons/im";
import { collection, getDocs, deleteDoc, doc, query, where, writeBatch, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import '@firebase/firestore';
import { useSnackbar } from 'notistack';
import { CSVLink } from 'react-csv';

const TableOne = () => {
    const [users, setUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const { enqueueSnackbar } = useSnackbar();
    const [keyword, setKeyword] = useState("");

    console.log("usser",displayedUsers)

    const fetchUsers = async (searchKeyword = "") => {
        try {
            let q;
            if (searchKeyword.trim()) {
                q = query(
                    collection(db, 'students'), // Ensure this is the correct collection
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

    const deleteUserHandler = async (userId, referralCode) => {
        try {
            const userRef = doc(db, 'students', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                enqueueSnackbar('User does not exist', { variant: 'error' });
                return;
            }

            const userData = userDoc.data();
            const referrerID = userData.referrerID;

            await deleteDoc(userRef);
            enqueueSnackbar('User deleted successfully', { variant: 'success' });

            if (referrerID) {
                const referrerRef = doc(db, 'students', referrerID);
                await updateDoc(referrerRef, {
                    referralCount: increment(-1)
                });
            }

            const q = query(collection(db, 'students'), where('referralByCode', '==', referralCode));
            const querySnapshot = await getDocs(q);

            const batch = writeBatch(db);
            querySnapshot.forEach((userDoc) => {
                batch.update(userDoc.ref, {
                    referralByCode: '',
                    referrerID: ''
                });
            });

            await batch.commit();

            fetchUsers();
        } catch (error) {
            console.error('Error deleting user or updating referrals: ', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(users.length / itemsPerPage)) {
            setCurrentPage(newPage);
        }
    };

    const sanitizeAndFormatCoins = (coinsString) => {
        const str = String(coinsString);
    
        const firstValidDecimalIndex = str.indexOf('.');
    
        let sanitizedCoins = str;
    
        if (firstValidDecimalIndex !== -1) {
            sanitizedCoins = str.slice(0, firstValidDecimalIndex + 1) + 
                             str.slice(firstValidDecimalIndex + 1).replace(/\./g, '');
        }
    
        const numberValue = Number(sanitizedCoins);
        return isNaN(numberValue) ? '0.00' : numberValue.toFixed(3);
    };

    const csvHeaders = [
        { label: 'Wallet Address', key: 'baseWalletAddress' },
        { label: 'First Name', key: 'firstName' },
        { label: 'Surname', key: 'surname' },
        { label: 'Email', key: 'email' },
        { label: 'Referral By Code', key: 'referralByCode' },
        { label: 'Referral Code', key: 'referralCode' },
        { label: 'Coins', key: 'coins' },
        { label: 'Mining Rate', key: 'hourlyRate' },
        { label: 'Total Referrals', key: 'referralCount' },
    ];

    return (
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
                    <CSVLink
                        data={users}
                        headers={csvHeaders}
                        filename={"users.csv"}
                        className="mb-6 text-base  dark:text-white bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                        Export to CSV
                    </CSVLink>
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
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Name</th>
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Father Name</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">B Form No.</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Reg No.</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Behaviour</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Residence Duration</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Studey Progress</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <p className="text-black dark:text-white">{user.name}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <p className="text-black dark:text-white">{user.fName}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.bFormNo}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.regNo}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.behaviour}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.residenceDuration}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.studyProgress}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <div className="flex items-center space-x-3.5">
                                                <button className="hover:text-primary" onClick={() => deleteUserHandler(user.id, user.referralCode)}>
                                                    <MdDeleteForever className="text-xl" />
                                                </button>
                                                <Link to={`/view/${user.id}`} className="hover:text-primary">
                                                    <ImEye className="text-base" />
                                                </Link>
                                                <Link to={`/update-user/${user.id}`} className="hover:text-primary">
                                                    <MdEdit className="text-xl" />
                                                </Link>
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
    );
};

export default TableOne;

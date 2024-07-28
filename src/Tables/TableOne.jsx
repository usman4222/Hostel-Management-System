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

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'profiles'));
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersList);
            setLoading(false);
            updateDisplayedUsers(usersList, 1, itemsPerPage); 
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

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        updateDisplayedUsers(users, currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, users]);

    const deleteUserHandler = async (userId, referralCode) => {
        try {
            const userRef = doc(db, 'profiles', userId);
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
                const referrerRef = doc(db, 'profiles', referrerID);
                await updateDoc(referrerRef, {
                    referralCount: increment(-1)
                });
            }

            const q = query(collection(db, 'profiles'), where('referralByCode', '==', referralCode));
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
                        All Users
                    </h4>
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
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Wallet Address</th>
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">First Name</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Surname</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Email</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Referral By Code</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Referral Code</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Mining Amount</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Mining Rate</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Total Referrals</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <p className="text-black dark:text-white">{user.baseWalletAddress}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <p className="text-black dark:text-white">{user.firstName}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.surname}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.email}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.referralByCode}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.referralCode}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.coins || 0}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white"> { user.hourlyRate  || 0}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{user.referralCount || 0}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <div className="flex items-center space-x-3.5">
                                                <button className="hover:text-primary" onClick={() => deleteUserHandler(user.id, user.referralCode)}>
                                                    <MdDeleteForever className="text-xl"/>
                                                </button>
                                                <Link to={`/view/${user.id}`} className="hover:text-primary">
                                                    <ImEye className="text-base"/>
                                                </Link>
                                                <Link to={`/edit/${user.id}`} className="hover:text-primary">
                                                    <MdEdit className="text-xl"/>
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

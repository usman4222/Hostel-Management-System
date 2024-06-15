import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { ImEye } from "react-icons/im";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import '@firebase/firestore';

const TableOne = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'profiles'));
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUserHandler = async (userId, referralCode) => {
        try {
            await deleteDoc(doc(db, 'profiles', userId));
            console.log(`User with ID ${userId} deleted successfully`);

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
            console.log(`Users updated successfully`);

            fetchUsers();
        } catch (error) {
            console.error('Error deleting user or updating referrals: ', error);
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
                <div className='flex flex-col justify-between md:flex-row'>
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        All Users
                    </h4>
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
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">First Name</th>
                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Surname</th>
                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Email</th>
                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Referral By Code</th>
                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Referral Code</th>
                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
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
                                        <div className="flex items-center space-x-3.5">
                                            <button className="hover:text-primary" onClick={() => deleteUserHandler(user.id, user.referralCode)}>
                                                <MdDeleteForever />
                                            </button>
                                            <Link to={`/update-user/${user.id}`}>
                                                <button className="hover:text-primary">
                                                    <MdEdit />
                                                </button>
                                            </Link>
                                            <Link to={`/profile/${user.id}`}>
                                                <button className="hover:text-primary">
                                                    <ImEye />
                                                </button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TableOne;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { ImEye } from "react-icons/im";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import '@firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';

const AllClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchClasses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'classes'));
            const classessList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setClasses(classessList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching classes: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const deleteUserHandler = async (userId) => {
        try {
            await deleteDoc(doc(db, 'classes', userId));
            enqueueSnackbar('Class deleted successfully', { variant: 'success' });
            console.log(`Blog with ID ${userId} deleted successfully`);
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting user or updating referrals: ', error);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Classes Table" />
            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="max-w-full overflow-x-auto">
                        <div className='flex flex-col justify-between md:flex-row'>
                            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                                All Classes
                            </h4>
                        </div>
                        {loading ? (
                            <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                    Loading...
                                </h4>
                            </div>
                        ) : classes.length === 0 ? (
                            <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                    No class Available
                                </h4>
                            </div>
                        ) : (
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Class Name</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Subjects</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((classItem) => (
                                        <tr key={classItem.id}>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{classItem.className}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <select className="w-full py-2 px-3 border border-gray-300 bg-white dark:bg-boxdark focus:outline-none dark:border-strokedark dark:text-white rounded-md">
                                                    {classItem.subjects.map((subject, index) => (
                                                        <option key={index} value={subject}>
                                                            {subject}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <div className="flex items-center space-x-3.5">
                                                    <button className="hover:text-primary" onClick={() => deleteUserHandler(classItem.id)}>
                                                        <MdDeleteForever />
                                                    </button>
                                                    <Link to={`/update-class/${classItem.id}`}>
                                                        <button className="hover:text-primary">
                                                            <MdEdit />
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
            </div>
        </DefaultLayout>
    );
};

export default AllClasses;

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

const AllExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchExams = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'exams'));
            const examsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setExams(examsList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching classes: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const deleteExamHandler = async (userId) => {
        try {
            await deleteDoc(doc(db, 'exams', userId));
            enqueueSnackbar('Exam deleted successfully', { variant: 'success' });
            console.log(`Exam with ID ${userId} deleted successfully`);
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting user or updating referrals: ', error);
        }
    };

    const formatTerm = (term) => {
        if (term === 'weekly') return 'Weekly';
        if (term === 'monthly') return 'Montly';
        if (term === 'midterm') return 'Mid Term';
        if (term === 'finalterm') return 'Final Term';
        return term;
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
                        ) : exams.length === 0 ? (
                            <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                    No exam Available
                                </h4>
                            </div>
                        ) : (
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Exam Term</th>
                                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Subject</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Total Marks</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Obtain Mark</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Percentage</th>
                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((examItem) => (
                                        <tr key={examItem.id}>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{formatTerm(examItem.examTerm)}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{examItem.subject}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{examItem.totalMarks}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">{examItem.obtainedMarks}</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white"> {(examItem.obtainedMarks / examItem.totalMarks) * 100}%</p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <div className="flex items-center space-x-3.5">
                                                    <button className="hover:text-primary" onClick={() => deleteExamHandler(examItem.id)}>
                                                        <MdDeleteForever />
                                                    </button>
                                                    <Link to={`/update-exam/${examItem.id}`}>
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

export default AllExams;

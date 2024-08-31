import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { ImEye } from "react-icons/im";
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import '@firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import DelDialogue from '../DelDialogue';

const AllClasses = () => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState("");
    const { enqueueSnackbar } = useSnackbar();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
    const [classToDelete, setClassToDelete] = useState(null);
    const [delLoading, setDelLoading] = useState(false)

    const fetchClasses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'classes'));
            const classList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setClasses(classList);
            setFilteredClasses(classList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching classes: ", error);
            setLoading(false);
        }
    };

    const filterClasses = () => {
        if (selectedClass.trim()) {
            const filtered = classes.filter(cls => cls.className === selectedClass.trim());
            setFilteredClasses(filtered);
        } else {
            setFilteredClasses(classes);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        filterClasses();
    }, [selectedClass, classes]);

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
    };

    const confirmDeleteUser = (classId) => {
        setClassToDelete(classId);
        setDelLoading(false);
        setShowDeleteDialog(true);
    };

    const deleteClassHandler = async () => {
        try {
            setDelLoading(true);
            await deleteDoc(doc(db, 'classes', classToDelete));
            enqueueSnackbar('Class deleted successfully', { variant: 'success' });
            fetchClasses();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting class: ', error);
        }
        finally{
            setDelLoading(false);
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
                        <div className="mb-4 w-50">
                            <label className="mb-2 block text-black dark:text-white">
                                Filter by Class
                            </label>
                            <select
                                value={selectedClass}
                                onChange={handleClassChange}
                                className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                                <option value="">Select a class</option>
                                {[...new Set(classes.map(cls => cls.className))].map((className, index) => (
                                    <option key={index} value={className}>
                                        {className}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {loading ? (
                            <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                    Loading...
                                </h4>
                            </div>
                        ) : filteredClasses.length === 0 ? (
                            <div className='border-t border-[#eee] py-5 px-4 pl-9 dark:border-strokedark'>
                                <h4 className="mb-6 text-md font-semibold text-center text-black dark:text-white">
                                    No classes available
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
                                    {filteredClasses.map((classItem) => (
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
                                                    <button className="hover:text-primary">
                                                        <MdDeleteForever onClick={() => confirmDeleteUser(classItem.id)} />
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
                {showDeleteDialog && (
                    <DelDialogue
                        onClose={() => setShowDeleteDialog(false)}
                        onConfirm={deleteClassHandler}
                        loading={delLoading}
                    />
                )}
            </div>
        </DefaultLayout>
    );
};

export default AllClasses;

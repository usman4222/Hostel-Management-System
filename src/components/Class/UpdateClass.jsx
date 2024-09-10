import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const UpdateClass = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedClass, setSelectedClass] = useState('');
    const [subjects, setSubjects] = useState(['']);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const docRef = doc(db, 'classes', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const classData = docSnap.data();
                    setSelectedClass(classData.className);
                    setSubjects(classData.subjects);
                } else {
                    console.log('No such document!');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching class:', error);
                setLoading(false);
            }
        };

        fetchClass();
    }, [id]);

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
    };

    const addSubjectField = () => {
        setSubjects([...subjects, '']);
    };

    const removeSubjectField = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects);
    };

    const handleUpdateClass = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const updatedFields = {
                className: selectedClass,
                subjects: subjects.filter(subject => subject.trim() !== ''),
            };

            const classRef = doc(db, 'classes', id);
            await updateDoc(classRef, updatedFields);
            enqueueSnackbar('Class successfully updated!', { variant: 'success' });
            navigate('/all-class');
        } catch (error) {
            enqueueSnackbar('Error updating class and subjects', { variant: 'error' });
            console.error("Error updating class:", error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Update Class" />

            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Update Class
                            </h3>
                        </div>
                        <form onSubmit={handleUpdateClass}>
                            <div className="p-6.5">
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Select Class
                                    </label>
                                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                                        <select
                                            required
                                            value={selectedClass}
                                            onChange={handleClassChange}
                                            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="" disabled className="text-body dark:text-bodydark">
                                                Select your class
                                            </option>
                                            {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((classOption) => (
                                                <option key={classOption} value={classOption}>
                                                    {classOption}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                            <svg
                                                className="fill-current"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.8">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                        fill=""
                                                    ></path>
                                                </g>
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full mb-8.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Add Subjects
                                    </label>
                                    {subjects.map((subject, index) => (
                                        <div key={index} className="flex items-center mb-4">
                                            <input
                                                type="text"
                                                required
                                                placeholder={`Enter subject ${index + 1} name`}
                                                value={subject}
                                                onChange={(e) => handleSubjectChange(index, e.target.value)}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubjectField(index)}
                                                    className="ml-2 text-red-500 transition-all ease-in-out .3s hover:bg-primary hover:text-white hover:rounded-sm"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        className="w-6 h-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                            {index === subjects.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={addSubjectField}
                                                    className="ml-2 text-primary transition-all ease-in-out .3s hover:bg-primary hover:text-white hover:rounded-sm"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        className="w-6 h-6"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="flex w-full justify-center items-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                >
                                    {submitLoading ? <Spinner /> : 'Update Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default UpdateClass;

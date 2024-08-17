import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';

const AddClass = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    const [subjects, setSubjects] = useState(['']);
    const [isOptionSelected, setIsOptionSelected] = useState(false);

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
        setIsOptionSelected(true);
    };

    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
    };

    const addSubjectField = () => {
        setSubjects([...subjects, '']);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClass || subjects.some(subject => !subject)) {
            enqueueSnackbar('Please fill in all fields', { variant: 'warning' });
            return;
        }
        setLoading(true);
    
        try {
            const docRef = await addDoc(collection(db, 'classes'), {
                className: selectedClass,
                subjects: subjects.filter(subject => subject.trim() !== '') 
            });
            console.log('Document written with ID: ', docRef.id);
            enqueueSnackbar('Class and subjects added successfully', { variant: 'success' });
            setSelectedClass('');
            setSubjects(['']);
            setIsOptionSelected(false);
        } catch (error) {
            enqueueSnackbar('Error adding class and subjects', { variant: 'error' });
            console.error('Error adding document: ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add New Class" />
            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Add New Class
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit}>
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
                                            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${isOptionSelected ? 'text-black dark:text-white' : ''}`}
                                        >
                                            <option value="" disabled className="text-body dark:text-bodydark">
                                                Select your class
                                            </option>
                                            {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((classOption) => (
                                                <option key={classOption} value={classOption} className="text-body dark:text-bodydark">
                                                    {classOption}
                                                </option>
                                            ))}
                                        </select>
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
                                            {index === subjects.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={addSubjectField}
                                                    className="ml-2 text-primary"
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
                                    className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                    disabled={loading}
                                >
                                    Add Class
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AddClass;

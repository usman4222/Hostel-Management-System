import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Spinner from '../Spinner';
import FetchedClasses from '../FetchedClassess';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const AddExam = () => {
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examTerm, setExamTerm] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [obtainedMarks, setObtainedMarks] = useState('');
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClass) return;

            try {
                const q = query(collection(db, 'students'), where('classId', '==', selectedClass));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No students found for this class.");
                } else {
                    const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log("Students fetched:", studentsList);
                    setStudents(studentsList);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [selectedClass]);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedClass) return;

            try {
                const q = query(collection(db, 'classes'), where('__name__', '==', selectedClass));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No subjects found for this class.");
                } else {
                    const subjectsList = querySnapshot.docs.map(doc => doc.data().subjects || []);
                    console.log("Subjects fetched:", subjectsList.flat());
                    setSubjects(subjectsList.flat());
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };

        fetchSubjects();
    }, [selectedClass]);

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
    };

    const handleStudentChange = (e) => {
        setSelectedStudent(e.target.value);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    const handleExamTermChange = (e) => {
        setExamTerm(e.target.value);
    };

    const handleTotalMarksChange = (e) => {
        setTotalMarks(e.target.value);
    };

    const handleObtainedMarksChange = (e) => {
        setObtainedMarks(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedClass || !selectedStudent || !selectedSubject || !examTerm || !totalMarks || !obtainedMarks) {
            console.error("All fields are required");
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, 'exams'), {
                classId: selectedClass,
                studentId: selectedStudent,
                subject: selectedSubject,
                examTerm: examTerm,
                totalMarks: parseFloat(totalMarks),
                obtainedMarks: parseFloat(obtainedMarks),
            });
            enqueueSnackbar("Exam added successfully!", { variant: 'success' });
            setSelectedClass("")
            setSelectedStudent("")
            setSelectedSubject("")
            setExamTerm("")
            setTotalMarks("")
            setObtainedMarks("")
        } catch (error) {
            console.error("Error adding exam:", error);
        }

        setLoading(false);
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add New Exam" />
            <FetchedClasses setClasses={setClasses} />
            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Add New Exam
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6.5">
                                <div className="mb-4.5 ">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Select Exam Term
                                    </label>
                                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                                        <select
                                            required
                                            onChange={handleExamTermChange}
                                            value={examTerm}
                                            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        >
                                            <option value="" disabled>
                                                Select Exam Term
                                            </option>
                                            <option value="weekly">Weekly Exam</option>
                                            <option value="monthly">Monthly Exam</option>
                                            <option value="midterm">Mid Term</option>
                                            <option value="finalterm">Final Term</option>
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

                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Select Class
                                    </label>
                                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                                        <select
                                            required
                                            onChange={handleClassChange}
                                            value={selectedClass}
                                            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        >
                                            <option value="" >
                                                Select your class
                                            </option>
                                            {classes.length > 0 ? (
                                                classes.map((cls, index) => (
                                                    <option key={index} value={cls.id}>
                                                        {cls.className}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    No classes available.
                                                </option>
                                            )}
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

                                <div className="mb-4.5 ">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Select Student
                                    </label>
                                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                                        <select
                                            required
                                            onChange={handleStudentChange}
                                            value={selectedStudent}
                                            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        >
                                            <option value="">
                                                Select a student
                                            </option>
                                            {students.length > 0 ? (
                                                students.map((student, index) => (
                                                    <option key={index} value={student.id}>
                                                        {student.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    No students available.
                                                </option>
                                            )}
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

                                <div className="mb-4.5 ">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Select Subject
                                    </label>
                                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                                        <select
                                            required
                                            onChange={handleSubjectChange}
                                            value={selectedSubject}
                                            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        >
                                            <option value="">
                                                Select a subject
                                            </option>
                                            {subjects.length > 0 ? (
                                                subjects.map((subject, index) => (
                                                    <option key={index} value={subject}>
                                                        {subject}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    No subjects available.
                                                </option>
                                            )}
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

                                <div className="w-full mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Total Marks
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        onChange={handleTotalMarksChange}
                                        value={totalMarks}
                                        placeholder="Enter Total Marks"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="w-full mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Obtain Marks
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        onChange={handleObtainedMarksChange}
                                        value={obtainedMarks}
                                        placeholder="Enter Obtain Marks"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner /> : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AddExam;
